import { invoke } from "@tauri-apps/api/core";
import { Note, WindowLevel } from "../types";

export function createNote(): Promise<Note> {
  return invoke<Note>("create_note");
}

export function listNotes(): Promise<Note[]> {
  return invoke<Note[]>("list_notes");
}

export function getNote(id: string): Promise<Note> {
  return invoke<Note>("get_note", { id });
}

export function updateNote(note: Note): Promise<void> {
  return invoke("update_note", { note });
}

export function deleteNote(id: string): Promise<void> {
  return invoke("delete_note", { id });
}

export function updateNotePosition(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  return invoke("update_note_position", { id, x, y, width, height });
}

export function setWindowLevel(
  id: string,
  level: WindowLevel
): Promise<void> {
  return invoke("set_window_level", { id, level });
}

export function showNote(id: string): Promise<void> {
  return invoke("show_note", { id });
}

export function showAllNotes(): Promise<void> {
  return invoke("show_all_notes");
}

export function hideAllNotes(): Promise<void> {
  return invoke("hide_all_notes");
}

export function closeNoteWindow(id: string): Promise<void> {
  return invoke("close_note_window", { id });
}

export function saveImage(data: string, mimeType: string): Promise<string> {
  return invoke<string>("save_image", { data, mimeType });
}
