/**
 * Events Manager
 * Add, edit, and delete events
 */
import React, { useState, useEffect } from 'react';
import { fetchSection, updateSection, addItem, deleteItem } from '../../api/client';
import '../styles/editor.css';

interface Event {
    id: string;
    day: string;
    month: string;
    year: string;
    title: string;
    venue: string;
    city: string;
    country: string;
    ticketUrl: string;
}

const emptyEvent: Omit<Event, 'id'> = {
    day: '',
    month: '',
    year: new Date().getFullYear().toString(),
    title: '',
    venue: '',
    city: '',
    country: '',
    ticketUrl: ''
};

export default function EventsManager() {
    const [events, setEvents] = useState<Event[]>([]);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newEvent, setNewEvent] = useState(emptyEvent);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await fetchSection('events');
            setEvents(data || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load events' });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newEvent.title || !newEvent.day || !newEvent.month) {
            setMessage({ type: 'error', text: 'Please fill in required fields' });
            return;
        }

        setSaving(true);
        try {
            await addItem('events', newEvent);
            setNewEvent(emptyEvent);
            setIsAdding(false);
            await loadEvents();
            setMessage({ type: 'success', text: 'Event added successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add event' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingEvent) return;

        setSaving(true);
        try {
            const updatedEvents = events.map(e =>
                e.id === editingEvent.id ? editingEvent : e
            );
            await updateSection('events', updatedEvents);
            setEditingEvent(null);
            await loadEvents();
            setMessage({ type: 'success', text: 'Event updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update event' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await deleteItem('events', id);
            await loadEvents();
            setMessage({ type: 'success', text: 'Event deleted successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete event' });
        }
    };

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    if (loading) {
        return (
            <div className="editor-loading">
                <div className="editor-spinner"></div>
                <p>Loading events...</p>
            </div>
        );
    }

    return (
        <div className="editor-page">
            <div className="editor-header">
                <div>
                    <h1>Events</h1>
                    <p>Manage your upcoming events and performances</p>
                </div>
                {!isAdding && (
                    <button
                        className="editor-button editor-button--primary"
                        onClick={() => setIsAdding(true)}
                    >
                        + Add Event
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`editor-message editor-message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Add New Event Form */}
            {isAdding && (
                <div className="editor-card">
                    <h3>Add New Event</h3>
                    <div className="editor-form">
                        <div className="editor-row editor-row--3">
                            <div className="editor-field">
                                <label>Day *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={newEvent.day}
                                    onChange={(e) => setNewEvent({ ...newEvent, day: e.target.value })}
                                    placeholder="12"
                                />
                            </div>
                            <div className="editor-field">
                                <label>Month *</label>
                                <select
                                    value={newEvent.month}
                                    onChange={(e) => setNewEvent({ ...newEvent, month: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="editor-field">
                                <label>Year</label>
                                <input
                                    type="number"
                                    value={newEvent.year}
                                    onChange={(e) => setNewEvent({ ...newEvent, year: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="editor-field">
                            <label>Event Title *</label>
                            <input
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                placeholder="Winter Lights Festival"
                            />
                        </div>
                        <div className="editor-row">
                            <div className="editor-field">
                                <label>Venue</label>
                                <input
                                    type="text"
                                    value={newEvent.venue}
                                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                                    placeholder="Royal Albert Hall"
                                />
                            </div>
                            <div className="editor-field">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={newEvent.city}
                                    onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
                                    placeholder="London"
                                />
                            </div>
                        </div>
                        <div className="editor-row">
                            <div className="editor-field">
                                <label>Country</label>
                                <input
                                    type="text"
                                    value={newEvent.country}
                                    onChange={(e) => setNewEvent({ ...newEvent, country: e.target.value })}
                                    placeholder="UK"
                                />
                            </div>
                            <div className="editor-field">
                                <label>Ticket URL</label>
                                <input
                                    type="text"
                                    value={newEvent.ticketUrl}
                                    onChange={(e) => setNewEvent({ ...newEvent, ticketUrl: e.target.value })}
                                    placeholder="https://tickets.example.com"
                                />
                            </div>
                        </div>
                        <div className="editor-actions">
                            <button
                                className="editor-button editor-button--primary"
                                onClick={handleAdd}
                                disabled={saving}
                            >
                                {saving ? 'Adding...' : 'Add Event'}
                            </button>
                            <button
                                className="editor-button"
                                onClick={() => { setIsAdding(false); setNewEvent(emptyEvent); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Events List */}
            <div className="editor-list">
                {events.length === 0 ? (
                    <div className="editor-empty">
                        <p>No events yet. Add your first event!</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="editor-list-item">
                            {editingEvent?.id === event.id ? (
                                // Edit Mode
                                <div className="editor-form">
                                    <div className="editor-row editor-row--3">
                                        <div className="editor-field">
                                            <label>Day</label>
                                            <input
                                                type="number"
                                                value={editingEvent.day}
                                                onChange={(e) => setEditingEvent({ ...editingEvent, day: e.target.value })}
                                            />
                                        </div>
                                        <div className="editor-field">
                                            <label>Month</label>
                                            <select
                                                value={editingEvent.month}
                                                onChange={(e) => setEditingEvent({ ...editingEvent, month: e.target.value })}
                                            >
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div className="editor-field">
                                            <label>Year</label>
                                            <input
                                                type="number"
                                                value={editingEvent.year}
                                                onChange={(e) => setEditingEvent({ ...editingEvent, year: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="editor-field">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={editingEvent.title}
                                            onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="editor-row">
                                        <div className="editor-field">
                                            <label>Venue</label>
                                            <input
                                                type="text"
                                                value={editingEvent.venue}
                                                onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                                            />
                                        </div>
                                        <div className="editor-field">
                                            <label>City</label>
                                            <input
                                                type="text"
                                                value={editingEvent.city}
                                                onChange={(e) => setEditingEvent({ ...editingEvent, city: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="editor-actions">
                                        <button
                                            className="editor-button editor-button--primary"
                                            onClick={handleUpdate}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            className="editor-button"
                                            onClick={() => setEditingEvent(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <div className="editor-list-item__content">
                                        <div className="editor-list-item__date">
                                            <span className="editor-list-item__day">{event.day}</span>
                                            <span className="editor-list-item__month">{event.month}</span>
                                        </div>
                                        <div className="editor-list-item__info">
                                            <h4>{event.title}</h4>
                                            <p>{event.venue}, {event.city}, {event.country}</p>
                                        </div>
                                    </div>
                                    <div className="editor-list-item__actions">
                                        <button
                                            className="editor-button editor-button--small"
                                            onClick={() => setEditingEvent(event)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="editor-button editor-button--small editor-button--danger"
                                            onClick={() => handleDelete(event.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
