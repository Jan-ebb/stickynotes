use crate::notes::Note;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

fn storage_dir() -> PathBuf {
    let dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("com.stickynotes.app");
    fs::create_dir_all(&dir).ok();
    dir
}

fn storage_path() -> PathBuf {
    storage_dir().join("notes.json")
}

pub fn media_dir() -> PathBuf {
    let dir = storage_dir().join("media");
    fs::create_dir_all(&dir).ok();
    dir
}

pub fn load_notes() -> HashMap<String, Note> {
    let path = storage_path();
    match fs::read_to_string(&path) {
        Ok(data) => {
            let notes: Vec<Note> = serde_json::from_str(&data).unwrap_or_default();
            notes.into_iter().map(|n| (n.id.clone(), n)).collect()
        }
        Err(_) => HashMap::new(),
    }
}

pub fn save_notes(notes: &HashMap<String, Note>) {
    let path = storage_path();
    let notes_vec: Vec<&Note> = notes.values().collect();
    if let Ok(data) = serde_json::to_string_pretty(&notes_vec) {
        fs::write(&path, data).ok();
    }
}
