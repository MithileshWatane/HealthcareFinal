import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, MapPin, Star, Filter, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceBookingWidget } from "@/components/VoiceBookingWidget";
import { cn } from "@/lib/utils";

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    specialty: "General Physician",
    rating: 4.9,
    reviews: 234,
    available: ["9:00 AM", "10:30 AM", "2:00 PM"],
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dr. Michael Roberts",
    specialty: "Cardiologist",
    rating: 4.8,
    reviews: 189,
    available: ["11:00 AM", "3:30 PM", "5:00 PM"],
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Emily Watson",
    specialty: "Dermatologist",
    rating: 4.9,
    reviews: 312,
    available: ["10:00 AM", "1:00 PM", "4:30 PM"],
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
  },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Appointments() {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(15);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isVoiceBookingOpen, setIsVoiceBookingOpen] = useState(false);

  const currentMonth = "January 2026";

  const handleVoiceBookingComplete = (details: any) => {
    console.log('Voice booking completed:', details);
    // Optionally update the UI with the booking details
    setIsVoiceBookingOpen(false);
  };

  return (
    <Layout>
      <div className="relative">
        <PageHeader
          icon={Calendar}
          title="Appointment Booking"
          description="Schedule appointments with our healthcare professionals based on real-time availability."
          gradient="bg-coral"
        />

        {/* Voice Booking Button */}
        <div className="absolute top-6 right-6">
          <Button
            onClick={() => setIsVoiceBookingOpen(true)}
            className="gradient-primary text-primary-foreground gap-2"
            size="lg"
          >
            <Phone className="w-5 h-5" />
            Book via Voice
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Doctor Selection */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-card border border-border p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Available Doctors
              </h3>
              <div className="flex gap-2">
                <Input placeholder="Search specialty..." className="w-48" />
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {doctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedDoctor(doctor.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    selectedDoctor === doctor.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{doctor.name}</h4>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                      <span className="text-sm text-muted-foreground">({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Available slots</p>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {doctor.available.slice(0, 2).map((time) => (
                        <span key={time} className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                          {time}
                        </span>
                      ))}
                      {doctor.available.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                          +{doctor.available.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-card border border-border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Select Date & Time
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-foreground">{currentMonth}</span>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square rounded-xl text-sm font-medium transition-all",
                    "hover:bg-primary/10",
                    selectedDate === day
                      ? "bg-primary text-primary-foreground"
                      : day < 12
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : "text-foreground"
                  )}
                  disabled={day < 12}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time Slots */}
            {selectedDoctor && selectedDate && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-medium text-foreground mb-3">Available Time Slots</h4>
                <div className="flex flex-wrap gap-2">
                  {doctors
                    .find((d) => d.id === selectedDoctor)
                    ?.available.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                          selectedTime === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Booking Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-card border border-border p-6 h-fit"
        >
          <h3 className="font-display font-semibold text-lg text-foreground mb-6">
            Booking Summary
          </h3>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Doctor</p>
                <p className="font-medium text-foreground">
                  {selectedDoctor
                    ? doctors.find((d) => d.id === selectedDoctor)?.name
                    : "Not selected"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">
                  {selectedDate ? `January ${selectedDate}, 2026` : "Not selected"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium text-foreground">
                  {selectedTime || "Not selected"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">MedCare Clinic, Main St.</p>
              </div>
            </div>
          </div>

          <Button
            className="w-full gradient-primary text-primary-foreground"
            disabled={!selectedDoctor || !selectedDate || !selectedTime}
          >
            Confirm Booking
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            You will receive a confirmation email and SMS
          </p>
        </motion.div>
      </div>

      {/* Voice Booking Widget */}
      <VoiceBookingWidget
        isOpen={isVoiceBookingOpen}
        onClose={() => setIsVoiceBookingOpen(false)}
        onBookingComplete={handleVoiceBookingComplete}
      />
    </Layout>
  );
}
