use crate::notes::{Note, WindowLevel};
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindowBuilder};
use tauri::utils::config::Color;

fn parse_hex_color(hex: &str) -> Color {
    let hex = hex.trim_start_matches('#');
    if hex.len() >= 6 {
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(10);
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(10);
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(10);
        Color(r, g, b, 255)
    } else {
        Color(10, 10, 10, 255)
    }
}

pub fn open_note_window(app: &AppHandle, note: &Note) -> Result<(), String> {
    // Check if window already exists
    if let Some(window) = app.get_webview_window(&note.id) {
        window.show().map_err(|e: tauri::Error| e.to_string())?;
        window
            .set_focus()
            .map_err(|e: tauri::Error| e.to_string())?;
        return Ok(());
    }

    let url = {
        let config = app.config();
        let base = if cfg!(debug_assertions) {
            config
                .build
                .dev_url
                .as_ref()
                .map(|u| u.to_string())
                .unwrap_or_else(|| "http://localhost:1420".to_string())
        } else {
            "tauri://localhost".to_string()
        };
        let full = format!("{}/?noteId={}", base.trim_end_matches('/'), note.id);
        WebviewUrl::External(full.parse().map_err(|e: url::ParseError| e.to_string())?)
    };

    let window = WebviewWindowBuilder::new(app, &note.id, url)
        .title("Sticky Note")
        .inner_size(note.width, note.height)
        .min_inner_size(180.0, 120.0)
        .position(note.x, note.y)
        .decorations(false)
        .visible(true)
        .resizable(true)
        .background_color(parse_hex_color(&note.bg_color))
        .build()
        .map_err(|e: tauri::Error| e.to_string())?;

    match note.window_level {
        WindowLevel::AlwaysOnTop => {
            if let Err(e) = window.set_always_on_top(true) {
                eprintln!("failed to set always_on_top for {}: {}", note.id, e);
            }
        }
        WindowLevel::Desktop => {
            if let Err(e) = window.set_always_on_bottom(true) {
                eprintln!("failed to set always_on_bottom for {}: {}", note.id, e);
            }
        }
        WindowLevel::Normal => {}
    }

    Ok(())
}

pub fn open_note_window_centered(app: &AppHandle, note: &Note) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&note.id) {
        window.show().map_err(|e: tauri::Error| e.to_string())?;
        window
            .set_focus()
            .map_err(|e: tauri::Error| e.to_string())?;
        return Ok(());
    }

    let url = {
        let config = app.config();
        let base = if cfg!(debug_assertions) {
            config
                .build
                .dev_url
                .as_ref()
                .map(|u| u.to_string())
                .unwrap_or_else(|| "http://localhost:1420".to_string())
        } else {
            "tauri://localhost".to_string()
        };
        let full = format!("{}/?noteId={}", base.trim_end_matches('/'), note.id);
        WebviewUrl::External(full.parse().map_err(|e: url::ParseError| e.to_string())?)
    };

    let window = WebviewWindowBuilder::new(app, &note.id, url)
        .title("Sticky Note")
        .min_inner_size(180.0, 120.0)
        .decorations(false)
        .visible(false)
        .resizable(true)
        .background_color(parse_hex_color(&note.bg_color))
        .build()
        .map_err(|e: tauri::Error| e.to_string())?;

    // Size and center on primary monitor
    if let Ok(Some(monitor)) = window.primary_monitor() {
        let screen = monitor.size();
        let win_w = screen.width / 2;
        let win_h = screen.height / 2;
        let x = (screen.width - win_w) / 2;
        let y = (screen.height - win_h) / 2;
        let _ = window.set_size(PhysicalSize::new(win_w, win_h));
        let _ = window.set_position(PhysicalPosition::new(x as i32, y as i32));
    }

    window.show().map_err(|e: tauri::Error| e.to_string())?;

    match note.window_level {
        WindowLevel::AlwaysOnTop => {
            if let Err(e) = window.set_always_on_top(true) {
                eprintln!("failed to set always_on_top for {}: {}", note.id, e);
            }
        }
        WindowLevel::Desktop => {
            if let Err(e) = window.set_always_on_bottom(true) {
                eprintln!("failed to set always_on_bottom for {}: {}", note.id, e);
            }
        }
        WindowLevel::Normal => {}
    }

    Ok(())
}
