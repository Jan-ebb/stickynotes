use crate::commands;
use crate::notes::NotesState;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let new_note = MenuItem::with_id(app, "new_note", "New Note", true, None::<&str>)?;
    let show_all = MenuItem::with_id(app, "show_all", "Show All Notes", true, None::<&str>)?;
    let hide_all = MenuItem::with_id(app, "hide_all", "Hide All Notes", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[&new_note, &show_all, &hide_all, &quit],
    )?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "new_note" => {
                let state = app.state::<NotesState>();
                if let Err(e) = commands::create_note(app.clone(), state) {
                    eprintln!("failed to create note from tray: {}", e);
                }
            }
            "show_all" => {
                let state = app.state::<NotesState>();
                if let Err(e) = commands::show_all_notes(app.clone(), state) {
                    eprintln!("failed to show all notes from tray: {}", e);
                }
            }
            "hide_all" => {
                let state = app.state::<NotesState>();
                if let Err(e) = commands::hide_all_notes(app.clone(), state) {
                    eprintln!("failed to hide all notes from tray: {}", e);
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}
