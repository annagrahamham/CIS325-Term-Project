import { useEffect, useState } from "react";
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
  const now = new Date();
  const userId = user?.id || null;
  const [activeTab, setActiveTab] = useState("calendar");
  const [monthCursor, setMonthCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [events, setEvents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedDayKey, setSelectedDayKey] = useState(getDayKey(now));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [orgForm, setOrgForm] = useState({ OrganizationName: "", Description: "", ContactEmail: "", ContactPhone: "" });
  const [eventForm, setEventForm] = useState({ OrganizationID_FK: "", EventName: "", EventType: "", Description: "", Location: "", StartTime: "", EndTime: "" });

  //loads all events so the calendar can display them
  async function loadEvents() {
    try {
      const res = await fetch("http://localhost:3000/api/events");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load events");
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
      const res = await fetch(`http://localhost:3000/api/users/${userId}/favorites`);
      const data = await res.json();
      if (!res.ok) return;
      setFavoriteIds(data.map((item) => item.EventID_PK));
    } catch {
      setError("Could not load favorites");
    }
  }

  //Loads organizations for event creation
  async function loadOrganizations() {
    try {
      const res = await fetch("http://localhost:3000/api/organizations");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load organizations");
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
    const url = isFavorite
      ? `http://localhost:3000/api/events/${eventId}/favorite/${userId}`
      : `http://localhost:3000/api/events/${eventId}/favorite`;
    const options = isFavorite
      ? { method: "DELETE" }
      : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) };
    const res = await fetch(url, options);
    if (!res.ok) {
      setError("Could not update favorites.");
      return;
    }

    await fetchFavorites();
  }

  //creates a new organization then reloads organizations for the dropdown
  async function createOrganization(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orgForm)
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create organization");
      return;
    }
    setMessage("Organization created.");
    setError("");
    setOrgForm({ OrganizationName: "", Description: "", ContactEmail: "", ContactPhone: "" });
    await loadOrganizations();
  }

  //creates a new event then reloads events
  async function createEvent(e) {
    e.preventDefault();
    const payload = { ...eventForm, OrganizationID_FK: eventForm.OrganizationID_FK || null };
    const res = await fetch("http://localhost:3000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create event");
      return;
    }
    setMessage("Event created.");
    setError("");
    setEventForm({ OrganizationID_FK: "", EventName: "", EventType: "", Description: "", Location: "", StartTime: "", EndTime: "" });
    await loadEvents();
  }

  return (
    <div className="dashboard dashboard-calendar">
      <div className="dashboard-topbar">
        <p className="dashboard-user">Signed in as {user ? user.email : ""}</p>
        <button type="button" onClick={onLogout}>Logout</button>
      </div>

      <div className="dashboard-tabs">
        <button type="button" onClick={() => setActiveTab("calendar")}>Calendar</button>
        <button type="button" onClick={() => setActiveTab("organizations")}>Organizations</button>
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
              <label htmlFor="orgName">Organization Name</label>
              <input id="orgName" value={orgForm.OrganizationName} onChange={(e) => setOrgForm({ ...orgForm, OrganizationName: e.target.value })} required />

              <label htmlFor="orgDescription">Description</label>
              <input id="orgDescription" value={orgForm.Description} onChange={(e) => setOrgForm({ ...orgForm, Description: e.target.value })} />

              <label htmlFor="orgEmail">Contact Email</label>
              <input id="orgEmail" value={orgForm.ContactEmail} onChange={(e) => setOrgForm({ ...orgForm, ContactEmail: e.target.value })} />

              <label htmlFor="orgPhone">Contact Phone</label>
              <input id="orgPhone" value={orgForm.ContactPhone} onChange={(e) => setOrgForm({ ...orgForm, ContactPhone: e.target.value })} />

              <button type="submit">Create Organization</button>
            </form>
          </section>

          <section className="organizer-panel">
            <h3>Create Event</h3>
            <form className="organizer-form" onSubmit={createEvent}>
              <label htmlFor="eventOrg">Organization</label>
              <select id="eventOrg" value={eventForm.OrganizationID_FK} onChange={(e) => setEventForm({ ...eventForm, OrganizationID_FK: e.target.value })}>
                <option value="">No organization</option>
                {organizations.map((org) => (
                  <option key={org.OrganizationID_PK} value={org.OrganizationID_PK}>
                    {org.OrganizationName}
                  </option>
                ))}
              </select>

              <label htmlFor="eventName">Event Name</label>
              <input id="eventName" value={eventForm.EventName} onChange={(e) => setEventForm({ ...eventForm, EventName: e.target.value })} required />

              <label htmlFor="eventType">Event Type (Club, Athletic, Workshop, etc)</label>
              <input id="eventType" value={eventForm.EventType} onChange={(e) => setEventForm({ ...eventForm, EventType: e.target.value })} />

              <label htmlFor="eventDescription">Description</label>
              <input id="eventDescription" value={eventForm.Description} onChange={(e) => setEventForm({ ...eventForm, Description: e.target.value })} />

              <label htmlFor="eventLocation">Location</label>
              <input id="eventLocation" value={eventForm.Location} onChange={(e) => setEventForm({ ...eventForm, Location: e.target.value })} required />

              <label htmlFor="eventStart">Start Time</label>
              <input type="datetime-local" id="eventStart" value={eventForm.StartTime} onChange={(e) => setEventForm({ ...eventForm, StartTime: e.target.value })} required />

              <label htmlFor="eventEnd">End Time</label>
              <input type="datetime-local" id="eventEnd" value={eventForm.EndTime} onChange={(e) => setEventForm({ ...eventForm, EndTime: e.target.value })} required />

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
