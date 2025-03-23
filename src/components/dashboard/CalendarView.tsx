import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Trash2,
  Bell,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: "interview" | "reminder" | "meeting";
  user_id: string;
  created_at: string;
}

export default function CalendarView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "reminder" as "interview" | "reminder" | "meeting",
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
    generateCalendarDays(currentMonth);
  }, [user, currentMonth]);

  const fetchEvents = async () => {
    try {
      // In a real app, this would fetch from a calendar_events table
      // For demo, we'll use mock data
      const mockEvents: CalendarEvent[] = [
        {
          id: "1",
          title: "Interview with ABC Construction",
          description: "Discuss the construction worker position",
          date: new Date(new Date().setDate(new Date().getDate() + 2))
            .toISOString()
            .split("T")[0],
          time: "10:00",
          location: "Westlands, Nairobi",
          type: "interview",
          user_id: user?.id || "",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Follow up with Quick Deliveries",
          description: "Check application status for delivery driver position",
          date: new Date(new Date().setDate(new Date().getDate() + 5))
            .toISOString()
            .split("T")[0],
          time: "14:30",
          location: "Phone call",
          type: "reminder",
          user_id: user?.id || "",
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Meeting with potential employer",
          description: "Discuss job opportunities in retail",
          date: new Date(new Date().setDate(new Date().getDate() - 1))
            .toISOString()
            .split("T")[0],
          time: "09:00",
          location: "CBD, Nairobi",
          type: "meeting",
          user_id: user?.id || "",
          created_at: new Date().toISOString(),
        },
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    // Get the first day of the week (Sunday = 0)
    const firstDayOfWeek = firstDay.getDay();

    // Generate array of dates for the calendar
    const days: Date[] = [];

    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek; i > 0; i--) {
      days.push(new Date(year, monthIndex, 1 - i));
    }

    // Add all days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, monthIndex, i));
    }

    // Add days from next month to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, monthIndex + 1, i));
      }
    }

    setCalendarDays(days);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    // In a real app, this would save to the database
    const newEventWithId: CalendarEvent = {
      ...newEvent,
      id: `event-${Date.now()}`,
      user_id: user?.id || "",
      created_at: new Date().toISOString(),
    };

    setEvents([...events, newEventWithId]);
    setShowAddEvent(false);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      type: "reminder",
    });

    toast({
      title: "Event added",
      description: "Your event has been added to the calendar.",
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));

    toast({
      title: "Event deleted",
      description: "The event has been removed from your calendar.",
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateString);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "interview":
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case "reminder":
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case "meeting":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "interview":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reminder":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "meeting":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-500" />
              Calendar
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-title">Event Title</Label>
                      <Input
                        id="event-title"
                        placeholder="e.g. Interview with ABC Company"
                        value={newEvent.title}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Date</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={newEvent.date}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-time">Time</Label>
                        <Input
                          id="event-time"
                          type="time"
                          value={newEvent.time}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, time: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-location">Location</Label>
                      <Input
                        id="event-location"
                        placeholder="e.g. Westlands, Nairobi or Phone call"
                        value={newEvent.location}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, location: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-type">Event Type</Label>
                      <select
                        id="event-type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newEvent.type}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            type: e.target.value as
                              | "interview"
                              | "reminder"
                              | "meeting",
                          })
                        }
                      >
                        <option value="interview">Interview</option>
                        <option value="reminder">Reminder</option>
                        <option value="meeting">Meeting</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        placeholder="Add details about this event..."
                        value={newEvent.description}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={handleAddEvent}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={
                        !newEvent.title || !newEvent.date || !newEvent.time
                      }
                    >
                      Add to Calendar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Calendar */}
            <div className="md:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
                  <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                    Previous
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {monthNames[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </h2>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    Next
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {weekdays.map((day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium bg-gray-50"
                    >
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    const isCurrentMonth =
                      day.getMonth() === currentMonth.getMonth();
                    const isToday =
                      day.toDateString() === new Date().toDateString();
                    const isSelected =
                      day.toDateString() === selectedDate.toDateString();
                    const dayEvents = getEventsForDate(day);

                    return (
                      <div
                        key={index}
                        className={`min-h-[80px] p-1 bg-white border-b border-r ${!isCurrentMonth ? "text-gray-400" : ""} ${isToday ? "bg-blue-50" : ""} ${isSelected ? "ring-2 ring-green-500 ring-inset" : ""}`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={`text-sm font-medium ${isToday ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`}
                          >
                            {day.getDate()}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 rounded-full px-1.5 py-0.5">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate flex items-center ${getEventTypeColor(event.type)}`}
                            >
                              {getEventTypeIcon(event.type)}
                              <span className="ml-1 truncate">
                                {event.title}
                              </span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 pl-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Events for selected date */}
            <div className="md:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-4 h-full">
                <h3 className="font-medium text-lg mb-4">
                  Events for{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>

                <div className="space-y-4">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            {getEventTypeIcon(event.type)}
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-xs mt-1">
                                {event.description}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-3 space-y-1 text-xs">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Calendar className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500">
                        No events scheduled for this day
                      </p>
                      <Button
                        className="mt-4 bg-green-600 hover:bg-green-700"
                        onClick={() => setShowAddEvent(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
