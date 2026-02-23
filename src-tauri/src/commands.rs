use crate::notes::{Note, NotesState, WindowLevel};
use crate::storage::{media_dir, save_notes};
use crate::window::open_note_window;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};

use base64::Engine;
use std::fs;

#[derive(Clone, Serialize)]
struct NotesChangedPayload {
    kind: &'static str,
    id: String,
}

fn emit_notes_changed(app: &AppHandle, kind: &'static str, id: &str) {
    let _ = app.emit(
        "notes-changed",
        NotesChangedPayload {
            kind,
            id: id.to_string(),
        },
    );
}

#[tauri::command]
pub fn create_note(app: AppHandle, state: State<'_, NotesState>) -> Result<Note, String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;
    let note = Note::new();
    let note_clone = note.clone();
    store.notes.insert(note.id.clone(), note);
    let snapshot = store.notes.clone();
    drop(store);
    save_notes(&snapshot);
    open_note_window(&app, &note_clone)?;
    emit_notes_changed(&app, "created", &note_clone.id);
    Ok(note_clone)
}

#[tauri::command]
pub fn list_notes(state: State<'_, NotesState>) -> Result<Vec<Note>, String> {
    let store = state.lock().map_err(|e| e.to_string())?;
    let mut notes: Vec<Note> = store.notes.values().cloned().collect();
    notes.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(notes)
}

#[tauri::command]
pub fn get_note(id: String, state: State<'_, NotesState>) -> Result<Note, String> {
    let store = state.lock().map_err(|e| e.to_string())?;
    store
        .notes
        .get(&id)
        .cloned()
        .ok_or_else(|| format!("Note {} not found", id))
}

#[tauri::command]
pub fn update_note(note: Note, app: AppHandle, state: State<'_, NotesState>) -> Result<(), String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;
    if store.notes.contains_key(&note.id) {
        let note_id = note.id.clone();
        store.notes.insert(note.id.clone(), note);
        let snapshot = store.notes.clone();
        drop(store);
        save_notes(&snapshot);
        emit_notes_changed(&app, "updated", &note_id);
        Ok(())
    } else {
        Err(format!("Note not found"))
    }
}

#[tauri::command]
pub fn delete_note(id: String, app: AppHandle, state: State<'_, NotesState>) -> Result<(), String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;
    store.notes.remove(&id);
    let snapshot = store.notes.clone();
    drop(store);
    save_notes(&snapshot);
    if let Some(window) = app.get_webview_window(&id) {
        window.destroy().map_err(|e| e.to_string())?;
    }
    emit_notes_changed(&app, "deleted", &id);
    Ok(())
}

#[tauri::command]
pub fn update_note_position(
    id: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    state: State<'_, NotesState>,
) -> Result<(), String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;
    if let Some(note) = store.notes.get_mut(&id) {
        note.x = x;
        note.y = y;
        note.width = width;
        note.height = height;
        let snapshot = store.notes.clone();
        drop(store);
        save_notes(&snapshot);
        Ok(())
    } else {
        Err(format!("Note not found"))
    }
}

#[tauri::command]
pub fn set_window_level(
    id: String,
    level: WindowLevel,
    app: AppHandle,
    state: State<'_, NotesState>,
) -> Result<(), String> {
    let mut store = state.lock().map_err(|e| e.to_string())?;
    if let Some(note) = store.notes.get_mut(&id) {
        note.window_level = level.clone();
        note.updated_at = chrono::Utc::now().to_rfc3339();
        let snapshot = store.notes.clone();
        drop(store);
        save_notes(&snapshot);

        if let Some(window) = app.get_webview_window(&id) {
            match level {
                WindowLevel::AlwaysOnTop => {
                    window
                        .set_always_on_bottom(false)
                        .map_err(|e| e.to_string())?;
                    window.set_always_on_top(true).map_err(|e| e.to_string())?;
                }
                WindowLevel::Desktop => {
                    window.set_always_on_top(false).map_err(|e| e.to_string())?;
                    window
                        .set_always_on_bottom(true)
                        .map_err(|e| e.to_string())?;
                }
                WindowLevel::Normal => {
                    window.set_always_on_top(false).map_err(|e| e.to_string())?;
                    window
                        .set_always_on_bottom(false)
                        .map_err(|e| e.to_string())?;
                }
            }
        }
        emit_notes_changed(&app, "updated", &id);
        Ok(())
    } else {
        Err(format!("Note not found"))
    }
}

#[tauri::command]
pub fn show_note(id: String, app: AppHandle, state: State<'_, NotesState>) -> Result<(), String> {
    let store = state.lock().map_err(|e| e.to_string())?;
    let note = store
        .notes
        .get(&id)
        .cloned()
        .ok_or_else(|| format!("Note {} not found", id))?;
    drop(store);
    open_note_window(&app, &note)?;
    Ok(())
}

#[tauri::command]
pub fn show_all_notes(app: AppHandle, state: State<'_, NotesState>) -> Result<(), String> {
    let store = state.lock().map_err(|e| e.to_string())?;
    let mut notes: Vec<Note> = store.notes.values().cloned().collect();
    drop(store);

    notes.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));

    let mut focus_target: Option<String> = None;
    for note in &notes {
        if let Some(window) = app.get_webview_window(&note.id) {
            window.show().map_err(|e| e.to_string())?;
            if focus_target.is_none() {
                focus_target = Some(note.id.clone());
            }
        } else {
            open_note_window(&app, note)?;
            if focus_target.is_none() {
                focus_target = Some(note.id.clone());
            }
        }
    }

    if let Some(id) = focus_target {
        if let Some(window) = app.get_webview_window(&id) {
            window.set_focus().map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn hide_all_notes(app: AppHandle, state: State<'_, NotesState>) -> Result<(), String> {
    let store = state.lock().map_err(|e| e.to_string())?;
    for note in store.notes.values() {
        if let Some(window) = app.get_webview_window(&note.id) {
            window.hide().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn close_note_window(id: String, app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&id) {
        window.destroy().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn save_image(data: String, mime_type: String) -> Result<String, String> {
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(&data)
        .map_err(|e| format!("Invalid base64: {}", e))?;

    let ext = match mime_type.as_str() {
        "image/png" => "png",
        "image/jpeg" | "image/jpg" => "jpg",
        "image/gif" => "gif",
        "image/webp" => "webp",
        "image/svg+xml" => "svg",
        _ => "png",
    };

    let filename = format!("{}.{}", uuid::Uuid::new_v4(), ext);
    let path = media_dir().join(&filename);
    fs::write(&path, &bytes).map_err(|e| format!("Failed to write image: {}", e))?;

    Ok(filename)
}
