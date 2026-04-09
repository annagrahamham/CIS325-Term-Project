Anna Graham
MSU Events App Database Schema

events.db


Table: users table

columns: UserID_PK, FirstName, LastName, Email, PhoneNumber, Password, Role, Major;

JSON format

{
  UserID_PK: int,
  FirstName: string,
  LastName: string,
  Email: string,
  PhoneNumber: string,
  Password: string,
  Role: string,
  Major: string
}


Table: organizations table

columns: OrganizationID_PK, OrganizationName, Description, PrimaryOrganizerID_FK, ContactEmail, ContactPhone;

JSON format

{
  OrganizationID_PK: int,
  OrganizationName: string,
  Description: string,
  PrimaryOrganizerID_FK: int,
  ContactEmail: string,
  ContactPhone: string
}


Table: followers table

columns: FollowerID_PK, UserID_FK, OrganizationID_FK;

JSON format

{
  FollowerID_PK: int,
  UserID_FK: int,
  OrganizationID_FK: int
}


Table: events table

columns: EventID_PK, OrganizationID_FK, EventName, EventType, Description, Location, StartTime, EndTime;

JSON format

{
  EventID_PK: int,
  OrganizationID_FK: int,
  EventName: string,
  EventType: string,
  Description: string,
  Location: string,
  StartTime: datetime,
  EndTime: datetime
}


Table: checkins table

columns: CheckID_PK, UserID_FK, EventID_FK;

JSON format

{
  CheckID_PK: int,
  UserID_FK: int,
  EventID_FK: int
}