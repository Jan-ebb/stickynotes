mod commands;
mod notes;
mod storage;
mod tray;
mod window;

use notes::{NotesState, NotesStore};
use std::sync::Mutex;
use tauri::Manager;
use tauri::http::Response as HttpResponse;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(Mutex::new(NotesStore::new()) as NotesState)
        .invoke_handler(tauri::generate_handler![
            commands::create_note,
            commands::list_notes,
            commands::get_note,
            commands::update_note,
            commands::delete_note,
            commands::show_note,
            commands::update_note_position,
            commands::set_window_level,
            commands::show_all_notes,
            commands::hide_all_notes,
            commands::close_note_window,
            commands::save_image,
        ])
        .register_uri_scheme_protocol("media", |_ctx, request| {
            let path = request.uri().path();
            let filename = path.trim_start_matches('/');
            let file_path = storage::media_dir().join(filename);

            match std::fs::read(&file_path) {
                Ok(bytes) => {
                    let mime = match file_path.extension().and_then(|e| e.to_str()) {
                        Some("png") => "image/png",
                        Some("jpg") | Some("jpeg") => "image/jpeg",
                        Some("gif") => "image/gif",
                        Some("webp") => "image/webp",
                        Some("svg") => "image/svg+xml",
                        _ => "application/octet-stream",
                    };
                    HttpResponse::builder()
                        .header("content-type", mime)
                        .body(bytes)
                        .unwrap()
                }
                Err(_) => HttpResponse::builder()
                    .status(404)
                    .body(Vec::new())
                    .unwrap(),
            }
        })
        .setup(|app| {
            let handle = app.handle().clone();

            // Load saved notes
            let saved = storage::load_notes();

            // Initialize store with saved notes
            {
                let state = handle.state::<NotesState>();
                let mut store = state.lock().unwrap();
                store.notes = saved;
            }

            // Setup system tray
            tray::setup_tray(&handle)?;

            // Open only the most recently updated note at startup (or create one if empty)
            {
                let state = handle.state::<NotesState>();
                let store = state.lock().unwrap();
                let latest = store
                    .notes
                    .values()
                    .max_by(|a, b| a.updated_at.cmp(&b.updated_at))
                    .cloned();
                drop(store);

                if let Some(note) = latest {
                    if let Err(e) = window::open_note_window_centered(&handle, &note) {
                        eprintln!("failed to open note {}: {}", note.id, e);
                    }
                } else {
                    let state = handle.state::<NotesState>();
                    if let Err(e) = commands::create_note(handle.clone(), state) {
                        eprintln!("failed to create initial note: {}", e);
                    }
                }
            }

            // Register global shortcut: Cmd+Shift+N
            use tauri_plugin_global_shortcut::GlobalShortcutExt;
            let handle_clone = handle.clone();
            handle.global_shortcut().on_shortcut(
                "CmdOrCtrl+Shift+N",
                move |_app, _shortcut, event| {
                    if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let state = handle_clone.state::<NotesState>();
                        if let Err(e) = commands::create_note(handle_clone.clone(), state) {
                            eprintln!("failed to create note from shortcut: {}", e);
                        }
                    }
                },
            )?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
