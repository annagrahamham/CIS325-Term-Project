import { useEffect, useState } from "react";
import { NavLink, Navigate, useNavigate, useParams } from 'react-router-dom';
import FormField from '../components/FormField';
import { apiRequest } from '../lib/api';
import "../styles.css";

// converts date to a string
function getDayKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

//format time into 0:00
function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// formats date into weekday, month day
function formatSelectedDate(dayKey) { return new Date(`${dayKey}T00:00:00`).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }); }

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab === 'organizations' ? 'organizations' : 'calendar';
  const now = new Date();
  const userId = user?.id || null;
  const [monthCursor, setMonthCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [events, setEvents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedDayKey, setSelectedDayKey] = useState(getDayKey(now));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [orgErrors, setOrgErrors] = useState({});
  const [eventErrors, setEventErrors] = useState({});
  const [orgForm, setOrgForm] = useState({ OrganizationName: "", Description: "", ContactEmail: "", ContactPhone: "" });
  const [eventForm, setEventForm] = useState({ OrganizationID_FK: "", EventName: "", EventType: "", Description: "", Location: "", StartTime: "", EndTime: "" });

  if (tab && tab !== 'calendar' && tab !== 'organizations') {
    return <Navigate to="/dashboard/calendar" replace />;
  }

  //loads all events so the calendar can display them
  async function loadEvents() {
    try {
      const data = await apiRequest('/events');
      setEvents(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load events");
    }
  }

  //Loads favorite events for the current user and stores them
  async function fetchFavorites() {
    if (!userId) return;
    try {
      const data = await apiRequest(`/users/${userId}/favorites`);
      setFavoriteIds(data.map((item) => item.EventID_PK));
    } catch (err) {
      setError("Could not load favorites");
    }
  }

  //Loads organizations for event creation
  async function loadOrganizations() {
    try {
      const data = await apiRequest('/organizations');
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load organizations");
    }
  }

  useEffect(() => {
    loadEvents();
    fetchFavorites();
    loadOrganizations();
  }, [userId]);

  const eventsByDay = {};
  for (const eventItem of events) {
    const startDate = new Date(eventItem.StartTime);
    if (Number.isNaN(startDate.getTime())) continue;
    const dayKey = getDayKey(startDate);
    if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
    eventsByDay[dayKey].push(eventItem);
  }
  for (const dayKey of Object.keys(eventsByDay)) eventsByDay[dayKey].sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime());

  const monthLabel = monthCursor.toLocaleDateString([], { month: "long", year: "numeric" });

  const firstDayOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
  const leadingEmptyCells = firstDayOfMonth.getDay();

  const dayCells = [];
  for (let i = 0; i < leadingEmptyCells; i += 1) {
    dayCells.push({ type: "empty", key: `empty-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateObj = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day);
    const dayKey = getDayKey(dateObj);
    dayCells.push({
      type: "day",
      key: dayKey,
      day,
      dayKey,
      events: eventsByDay[dayKey] || []
    });
  }

  const selectedDayEvents = eventsByDay[selectedDayKey] || [];

  //for favoriting or unfavoriting
  async function toggleFavorite(eventId) {
    if (!userId) return;
    const isFavorite = favoriteIds.includes(eventId);
    try {
      await apiRequest(
        isFavorite ? `/events/${eventId}/favorite/${userId}` : `/events/${eventId}/favorite`,
        isFavorite
          ? { method: 'DELETE' }
          : { method: 'POST', body: JSON.stringify({ userId }) }
      );
      await fetchFavorites();
    } catch {
      setError("Could not update favorites.");
    }
  }

  function validateOrganizationForm() {
    const nextErrors = {};
    const hasEmail = orgForm.ContactEmail.trim();
    const hasPhone = orgForm.ContactPhone.trim();

    if (!orgForm.OrganizationName.trim()) nextErrors.OrganizationName = 'Organization name is required.';
    if (hasEmail && !orgForm.ContactEmail.trim().includes('@')) nextErrors.ContactEmail = 'Enter a valid email.';
    if (hasPhone && !/^\d{10}$/.test(orgForm.ContactPhone.trim())) nextErrors.ContactPhone = 'Phone must be 10 digits.';

    setOrgErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateEventForm() {
    const nextErrors = {};
    const start = new Date(eventForm.StartTime);
    const end = new Date(eventForm.EndTime);

    if (!eventForm.EventName.trim()) nextErrors.EventName = 'Event name is required.';
    if (!eventForm.Location.trim()) nextErrors.Location = 'Location is required.';
    if (!eventForm.StartTime) nextErrors.StartTime = 'Start time is required.';
    if (!eventForm.EndTime) nextErrors.EndTime = 'End time is required.';
    if (eventForm.StartTime && eventForm.EndTime && start >= end) nextErrors.EndTime = 'End time must be after start time.';

    setEventErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  //creates a new organization then reloads organizations for the dropdown
  async function createOrganization(e) {
    e.preventDefault();
    if (!validateOrganizationForm()) {
      setError('Please correct organization form errors.');
      return;
    }

    try {
      await apiRequest('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          ...orgForm,
          OrganizationName: orgForm.OrganizationName.trim(),
          Description: orgForm.Description.trim(),
          ContactEmail: orgForm.ContactEmail.trim(),
          ContactPhone: orgForm.ContactPhone.trim()
        })
      });
      setMessage("Organization created.");
      setError("");
      setOrgErrors({});
      setOrgForm({ OrganizationName: "", Description: "", ContactEmail: "", ContactPhone: "" });
      await loadOrganizations();
    } catch (err) {
      setError(err.message || 'Could not create organization');
    }
  }

  //creates a new event then reloads events
  async function createEvent(e) {
    e.preventDefault();
    if (!validateEventForm()) {
      setError('Please correct event form errors.');
      return;
    }

    try {
      const payload = {
        ...eventForm,
        OrganizationID_FK: eventForm.OrganizationID_FK || null,
        EventName: eventForm.EventName.trim(),
        EventType: eventForm.EventType.trim(),
        Description: eventForm.Description.trim(),
        Location: eventForm.Location.trim()
      };
      await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setMessage("Event created.");
      setError("");
      setEventErrors({});
      setEventForm({ OrganizationID_FK: "", EventName: "", EventType: "", Description: "", Location: "", StartTime: "", EndTime: "" });
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Could not create event');
    }
  }

  return (
    <div className="dashboard dashboard-calendar">
      <div className="dashboard-topbar">
        <p className="dashboard-user">Signed in as {user ? user.email : ""}</p>
        <button
          type="button"
          onClick={() => {
            onLogout();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <NavLink to="/dashboard/calendar" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>Calendar</NavLink>
        <NavLink to="/dashboard/organizations" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>Organizations</NavLink>
      </div>

      {message && <p className="form-message success">{message}</p>}
      {error && <p className="form-message">{error}</p>}
      {activeTab === "calendar" && (
        <>
          <div className="calendar-header">
            <button type="button" onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}>Previous</button>
            <h2>{monthLabel}</h2>
            <button type="button" onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}>Next</button>
          </div>
          <div className="calendar-layout">
            <div className="calendar-grid-wrap">
              <div className="calendar-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
              <div className="calendar-grid">
                {dayCells.map((cell) => {
                  if (cell.type === "empty") return <div key={cell.key} className="calendar-cell empty" />;
                  const isSelected = selectedDayKey === cell.dayKey;
                  return (
                    <button key={cell.key} type="button" className={`calendar-cell day ${isSelected ? "selected" : ""}`} onClick={() => setSelectedDayKey(cell.dayKey)}>
                      <span className="day-number">{cell.day}</span>
                      <div className="day-events-preview">
                        {cell.events.map((eventItem) => <span key={eventItem.EventID_PK} className="event-chip">{formatTime(eventItem.StartTime)} {eventItem.EventName}</span>)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <aside className="day-panel">
              <h3>{formatSelectedDate(selectedDayKey)}</h3>
              {selectedDayEvents.length === 0 ? <p>No events for this day.</p> : (
                <ul>
                  {selectedDayEvents.map((eventItem) => (
                    <li key={eventItem.EventID_PK}>
                      <strong>{eventItem.EventName}</strong>
                      <span>{formatTime(eventItem.StartTime)} - {formatTime(eventItem.EndTime)}</span>
                      {eventItem.Location && <span>{eventItem.Location}</span>}
                      <button type="button" onClick={() => setSelectedEvent(eventItem)}>View Details</button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </>
      )}

      {activeTab === "organizations" && (
        <>
          <section className="organizer-panel">
            <h3>Create Organization</h3>
            <form className="organizer-form" onSubmit={createOrganization}>
              <FormField id="orgName" label="Organization Name" value={orgForm.OrganizationName} onChange={(e) => setOrgForm({ ...orgForm, OrganizationName: e.target.value })} required error={orgErrors.OrganizationName} />
              <FormField id="orgDescription" label="Description" value={orgForm.Description} onChange={(e) => setOrgForm({ ...orgForm, Description: e.target.value })} />
              <FormField id="orgEmail" type="email" label="Contact Email" value={orgForm.ContactEmail} onChange={(e) => setOrgForm({ ...orgForm, ContactEmail: e.target.value })} error={orgErrors.ContactEmail} />
              <FormField id="orgPhone" type="tel" label="Contact Phone" value={orgForm.ContactPhone} onChange={(e) => setOrgForm({ ...orgForm, ContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} error={orgErrors.ContactPhone} />

              <button type="submit">Create Organization</button>
            </form>
          </section>

          <section className="organizer-panel">
            <h3>Create Event</h3>
            <form className="organizer-form" onSubmit={createEvent}>
              <FormField
                id="eventOrg"
                label="Organization"
                value={eventForm.OrganizationID_FK}
                onChange={(e) => setEventForm({ ...eventForm, OrganizationID_FK: e.target.value })}
                options={[
                  { value: '', label: 'No organization' },
                  ...organizations.map((org) => ({ value: String(org.OrganizationID_PK), label: org.OrganizationName }))
                ]}
              />

              <FormField id="eventName" label="Event Name" value={eventForm.EventName} onChange={(e) => setEventForm({ ...eventForm, EventName: e.target.value })} required error={eventErrors.EventName} />
              <FormField id="eventType" label="Event Type (Club, Athletic, Workshop, etc)" value={eventForm.EventType} onChange={(e) => setEventForm({ ...eventForm, EventType: e.target.value })} />
              <FormField id="eventDescription" label="Description" value={eventForm.Description} onChange={(e) => setEventForm({ ...eventForm, Description: e.target.value })} />
              <FormField id="eventLocation" label="Location" value={eventForm.Location} onChange={(e) => setEventForm({ ...eventForm, Location: e.target.value })} required error={eventErrors.Location} />
              <FormField id="eventStart" type="datetime-local" label="Start Time" value={eventForm.StartTime} onChange={(e) => setEventForm({ ...eventForm, StartTime: e.target.value })} required error={eventErrors.StartTime} />
              <FormField id="eventEnd" type="datetime-local" label="End Time" value={eventForm.EndTime} onChange={(e) => setEventForm({ ...eventForm, EndTime: e.target.value })} required error={eventErrors.EndTime} />

              <button type="submit">Create Event</button>
            </form>
          </section>
        </>
      )}

      {selectedEvent && (
        <div className="event-details-card">
          <h3>{selectedEvent.EventName}</h3>
          {selectedEvent.OrganizationName && <p>Organization: {selectedEvent.OrganizationName}</p>}
          <p>{new Date(selectedEvent.StartTime).toLocaleString()} - {new Date(selectedEvent.EndTime).toLocaleString()}</p>
          <p>{selectedEvent.Location}</p>
          <p>{selectedEvent.Description || "No description"}</p>
          <div className="event-actions">
            <button type="button" onClick={() => toggleFavorite(selectedEvent.EventID_PK)}>
              {favoriteIds.includes(selectedEvent.EventID_PK) ? "Unfavorite" : "Favorite"}
            </button>
          </div>
          <button type="button" onClick={() => setSelectedEvent(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
