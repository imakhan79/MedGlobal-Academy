import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Globe, 
  PlusCircle, 
  Tag, 
  Award, 
  CheckCircle, 
  CreditCard, 
  X, 
  Play, 
  MessageSquare, 
  ThumbsUp, 
  Filter, 
  User, 
  Activity,
  ArrowRight,
  Sparkles,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";

interface CourseReview {
  reviewer: string;
  stars: number;
  date: string;
  comment: string;
}

interface SyllabusSection {
  title: string;
  duration: string;
  lectures: string[];
}

interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  instructorName: string;
  instructorTitle: string;
  country: string;
  rating: number;
  ratingCount: number;
  studentsCount: number;
  price: number;
  currency: string;
  thumbnail: string;
  durationHours: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  syllabus: SyllabusSection[];
  reviews: CourseReview[];
}

export default function MedicalSkillMarketplace() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "students" | "price-asc" | "price-desc" | "duration">("rating");

  // Selection states
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<Record<string, boolean>>({});
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  // Course Creator Panel
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newCategory, setNewCategory] = useState("USMLE");
  const [newInstructor, setNewInstructor] = useState("");
  const [newInstTitle, setNewInstTitle] = useState("");
  const [newCountry, setNewCountry] = useState("United States");
  const [newPrice, setNewPrice] = useState("39");
  const [newCurrency, setNewCurrency] = useState("USD");
  const [newLevel, setNewLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [newDuration, setNewDuration] = useState("8");
  const [syllabusSections, setSyllabusSections] = useState<SyllabusSection[]>([
    { title: "Introduction & Core Concepts", duration: "2 hours", lectures: ["Welcome & Syllabus Mapping", "High-Yield Diagnostics Fundamentals"] }
  ]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newLectureText, setNewLectureText] = useState("");
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

  // Review Submissions
  const [reviewName, setReviewName] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Active Lecture Study Room
  const [activeLecture, setActiveLecture] = useState<string | null>(null);
  const [activeLectureSection, setActiveLectureSection] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<"none" | "unsolved" | "correct" | "incorrect">("none");
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);

  // Unique list of countries from current courses for dynamic filtering
  const countriesList = ["All", ...Array.from(new Set(courses.map(c => c.country)))];
  const categoriesList = ["All", "USMLE", "PLAB/UKMLA", "MRCP/MRCS", "Clinical Skills", "Emergency Medicine"];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/marketplace/courses");
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Error loading courses from marketplace api:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newInstructor || !newCategory) return;
    setIsSubmittingCourse(true);

    try {
      const res = await fetch("/api/marketplace/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          subtitle: newSubtitle,
          category: newCategory,
          instructorName: newInstructor,
          instructorTitle: newInstTitle,
          country: newCountry,
          price: Number(newPrice),
          currency: newCurrency,
          level: newLevel,
          durationHours: Number(newDuration),
          syllabus: syllabusSections
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh local courses list
        await fetchCourses();
        // Clear inputs
        setNewTitle("");
        setNewSubtitle("");
        setNewInstructor("");
        setNewInstTitle("");
        setSyllabusSections([
          { title: "Introduction & Core Concepts", duration: "2 hours", lectures: ["Welcome & Syllabus Mapping", "High-Yield Diagnostics Fundamentals"] }
        ]);
        setShowCreator(false);
      }
    } catch (err) {
      console.error("Failed to create user-generated course:", err);
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleAddSyllabusSection = () => {
    if (!newSectionTitle) return;
    setSyllabusSections(prev => [
      ...prev,
      { title: newSectionTitle, duration: "2 hours", lectures: newLectureText ? newLectureText.split("\n").filter(Boolean) : ["Foundational Lecture 1"] }
    ]);
    setNewSectionTitle("");
    setNewLectureText("");
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse || !reviewName || !reviewComment) return;
    setIsSubmittingReview(true);

    try {
      const res = await fetch(`/api/marketplace/courses/${activeCourse.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer: reviewName,
          stars: reviewStars,
          comment: reviewComment
        })
      });
      const data = await res.json();
      if (res.ok && data.course) {
        // Update activeCourse overview and course grid list
        setActiveCourse(data.course);
        setCourses(prev => prev.map(c => c.id === data.course.id ? data.course : c));
        setReviewName("");
        setReviewComment("");
        setReviewStars(5);
      }
    } catch (err) {
      console.error("Failed to submit course review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEnrollCourse = (courseId: string) => {
    setEnrollingCourseId(courseId);
    setTimeout(() => {
      setIsEnrolled(prev => ({ ...prev, [courseId]: true }));
      setEnrollingCourseId(null);
    }, 1500);
  };

  // Filter & Sort logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === "All" || course.country === selectedCountry;
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;

    return matchesSearch && matchesCountry && matchesCategory && matchesLevel;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "students") return b.studentsCount - a.studentsCount;
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "duration") return b.durationHours - a.durationHours;
    return 0;
  });

  // Simulated Quiz validation for active lecture
  const checkAnswer = (index: number) => {
    setSelectedQuizAnswer(index);
    // Let's make index 1 (the second choice) represent the correct option for clinical fun
    if (index === 1) {
      setQuizState("correct");
    } else {
      setQuizState("incorrect");
    }
  };

  return (
    <div className="space-y-8" id="medical-skill-marketplace-wrapper">
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-r from-[#003B95] via-[#0452C4] to-[#0A3D8A] rounded-3xl p-6 md:p-8 text-white shadow-lg border border-blue-900 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/35 py-1 px-3 rounded-full text-[10px] font-black tracking-widest text-emerald-300 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verified Peer-to-Peer Learning</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif italic font-extrabold tracking-tight">
              Medical Skill Marketplace
            </h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed max-w-xl font-medium">
              The first "Udemy for Medical Licensing." Purchase niche curricula, enroll in clinical board reviews, review country-specific instructors, and publish your own high-yield expertise.
            </p>
          </div>

          <button
            onClick={() => setShowCreator(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-6 rounded-2xl transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer self-stretch md:self-auto justify-center"
            id="publish-course-trigger"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Publish Your Course</span>
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Course Filter Sidebar / Controls */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-[#003B95]" />
                <span>Search & Filter</span>
              </span>
              {(selectedCountry !== "All" || selectedCategory !== "All" || selectedLevel !== "All" || searchQuery) && (
                <button 
                  onClick={() => {
                    setSelectedCountry("All");
                    setSelectedCategory("All");
                    setSelectedLevel("All");
                    setSearchQuery("");
                  }}
                  className="text-[10px] text-red-500 hover:underline font-bold"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Keyword Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Renal, NICE, Cardiology..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 pl-9 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Exam / Specialty Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                ))}
              </select>
            </div>

            {/* Country specific filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Instructor Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
              >
                {countriesList.map(country => (
                  <option key={country} value={country}>{country === "All" ? "All Countries" : country}</option>
                ))}
              </select>
            </div>

            {/* Specialty difficulty Level */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Clinical Mastery Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner Trainee</option>
                <option value="Intermediate">Intermediate registrar</option>
                <option value="Advanced">Advanced Board Eligible</option>
              </select>
            </div>

            {/* Sort Criteria */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Sort Matrix</label>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
              >
                <option value="rating">Highest Rated ★</option>
                <option value="students">Popularity (Most Enrolled)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration">Estimated Duration (Longest)</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 rounded-3xl text-white shadow-sm space-y-4">
            <h4 className="text-xs font-serif italic font-extrabold text-blue-200">Global Faculty Analytics</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <span className="text-xl font-bold font-mono text-emerald-400">{courses.length}</span>
                <span className="text-[9px] block text-slate-400 font-extrabold uppercase mt-1">Courses</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <span className="text-xl font-bold font-mono text-cyan-400">
                  {courses.reduce((acc, c) => acc + c.studentsCount, 0)}
                </span>
                <span className="text-[9px] block text-slate-400 font-extrabold uppercase mt-1">Enrollees</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal text-center italic">
              Instructors from over {Array.from(new Set(courses.map(c => c.country))).length} countries verified active.
            </p>
          </div>
        </div>

        {/* Courses Listing & Display */}
        <div className="lg:col-span-9 space-y-6">
          {isLoading ? (
            <div className="bg-white border border-[#E2E8F0] p-12 rounded-3xl text-center space-y-4">
              <Clock className="h-8 w-8 text-[#003B95] animate-spin mx-auto" />
              <div className="text-sm text-slate-500 font-semibold">Querying Global P2P Medical Database...</div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-12 rounded-3xl text-center space-y-4">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">No matching peer courses found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active instructors match your criteria. Expand your filter options or publish your own course to support incoming graduates.
              </p>
              <button
                onClick={() => {
                  setSelectedCountry("All");
                  setSelectedCategory("All");
                  setSelectedLevel("All");
                  setSearchQuery("");
                }}
                className="bg-[#003B95] text-white font-extrabold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -4, borderColor: "#003B95" }}
                  className="bg-white border border-[#E2E8F0] rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition-all overflow-hidden"
                  id={`course-card-${course.id}`}
                >
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Top bar */}
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-2xl" role="img" aria-label="course thumbnail">
                          {course.thumbnail || "🎓"}
                        </span>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[9px] font-black bg-blue-50 text-[#003B95] py-0.5 px-2 rounded-md uppercase tracking-wider">
                            {course.category}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {course.country}
                          </span>
                        </div>
                      </div>

                      {/* Course Titles */}
                      <div>
                        <h4 className="font-serif italic font-extrabold text-sm text-[#0F172A] leading-tight hover:text-[#003B95] cursor-pointer" onClick={() => setActiveCourse(course)}>
                          {course.title}
                        </h4>
                        <p className="text-[11px] text-[#64748B] font-medium leading-relaxed mt-1 line-clamp-2">
                          {course.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Instructor Segment */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-[#F1F5F9] text-slate-500 rounded-full flex items-center justify-center border border-slate-200 shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-800 block truncate">{course.instructorName}</span>
                        <span className="text-[9px] text-slate-400 block truncate font-medium">{course.instructorTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase/Footer segment */}
                  <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-5 py-3.5 flex items-center justify-between">
                    {/* Stars and cost */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-slate-800 font-mono">{course.rating}</span>
                        <span className="text-[9px] text-slate-400 font-semibold font-mono">({course.ratingCount})</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                        {course.studentsCount} Students
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-[#003B95] block font-mono">
                        {course.price === 0 ? "FREE" : `${course.price} ${course.currency}`}
                      </span>
                      <button
                        onClick={() => setActiveCourse(course)}
                        className="text-[9px] font-black uppercase tracking-widest text-[#003B95] hover:underline flex items-center gap-0.5 cursor-pointer mt-0.5"
                      >
                        <span>Preview Syllabus</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Creator Drawer / Slide-Over Modal */}
      <AnimatePresence>
        {showCreator && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E2E8F0] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
              id="course-creator-modal"
            >
              {/* Header */}
              <div className="bg-[#003B95] text-white p-5 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-serif italic font-extrabold text-base md:text-lg">Publish Course Syllabus</h3>
                  <span className="text-[9px] text-blue-200 uppercase tracking-widest font-black">Join the peer-to-peer medical faculty</span>
                </div>
                <button 
                  onClick={() => setShowCreator(false)}
                  className="p-1.5 hover:bg-blue-900 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable form */}
              <form onSubmit={handleCreateCourse} className="p-6 overflow-y-auto space-y-5 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Course Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acid-Base Equilibrium & Henderson-Hasselbalch"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Syllabus Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
                    >
                      <option value="USMLE">USMLE Boards</option>
                      <option value="PLAB/UKMLA">PLAB / UKMLA</option>
                      <option value="MRCP/MRCS">MRCP / MRCS</option>
                      <option value="Clinical Skills">OSCE Clinical Skills</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">High-Yield Description & Target Outcomes</label>
                  <input
                    type="text"
                    required
                    placeholder="Provide a 1-sentence value proposition to prospective registrants..."
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Instructor Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Pendelton"
                      value={newInstructor}
                      onChange={(e) => setNewInstructor(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Professional Credentials</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MD, Cardiology Registrar"
                      value={newInstTitle}
                      onChange={(e) => setNewInstTitle(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Instructor Country</label>
                    <select
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Egypt">Egypt</option>
                      <option value="India">India</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Australia">Australia</option>
                      <option value="Nigeria">Nigeria</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Set Price</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g. 29"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Currency</label>
                    <select
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Estimated Hours</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 8"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">Trainee Level</label>
                    <select
                      value={newLevel}
                      onChange={(e: any) => setNewLevel(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003B95] cursor-pointer"
                    >
                      <option value="Beginner">Beginner Trainee</option>
                      <option value="Intermediate">Intermediate Registrar</option>
                      <option value="Advanced">Advanced Fellow</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Syllabus builder */}
                <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 block">Configure Course Syllabus Outline</span>
                  
                  {syllabusSections.map((sec, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/50 space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>Section {idx+1}: {sec.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">({sec.duration})</span>
                      </div>
                      <ul className="list-disc pl-5 text-[10px] text-slate-500 space-y-0.5">
                        {sec.lectures.map((lec, lIdx) => (
                          <li key={lIdx}>{lec}</li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Syllabus Section Title (e.g. ECG Lead Patterns)"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      className="bg-white border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                    />
                    <textarea
                      placeholder="Lectures (one title per line)"
                      rows={2}
                      value={newLectureText}
                      onChange={(e) => setNewLectureText(e.target.value)}
                      className="bg-white border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSyllabusSection}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-[#003B95] font-extrabold text-[9px] uppercase tracking-wider py-2 rounded-xl transition-all"
                  >
                    + Add Section to Syllabus
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreator(false)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCourse}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    {isSubmittingCourse ? "Publishing to Marketplace..." : "Publish Course Curriculum"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Course Detail & Interactive Study Room Modal */}
      <AnimatePresence>
        {activeCourse && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E2E8F0] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              id="course-viewer-modal"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#003B95] to-blue-950 text-white p-5 md:p-6 shrink-0 flex justify-between items-start gap-4">
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[10px] font-bold bg-blue-500/25 border border-blue-500/35 py-0.5 px-2 rounded-md uppercase tracking-wider">
                    {activeCourse.category} Class
                  </span>
                  <h3 className="font-serif italic font-extrabold text-lg md:text-xl leading-tight">
                    {activeCourse.title}
                  </h3>
                  <p className="text-xs text-blue-200 leading-normal line-clamp-1">{activeCourse.subtitle}</p>
                </div>

                <button 
                  onClick={() => {
                    setActiveCourse(null);
                    setActiveLecture(null);
                    setActiveLectureSection(null);
                    setQuizState("none");
                  }}
                  className="p-1.5 hover:bg-blue-900 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Grid content split into study panels */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
                
                {/* Left side: Syllabus & Interactive Player */}
                <div className="md:col-span-7 p-6 border-r border-slate-100 space-y-6">
                  {/* Lecture Player */}
                  {activeLecture ? (
                    <div className="bg-slate-950 rounded-2xl p-5 text-white space-y-4 shadow-inner relative overflow-hidden" id="interactive-lecture-player">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                      
                      <div className="flex justify-between items-center text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest border-b border-slate-800 pb-2">
                        <span>LECTURE STUDY ROOM</span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3 animate-pulse" /> Live Session Stream
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium block">{activeLectureSection}</span>
                        <h4 className="text-base font-serif italic font-bold">{activeLecture}</h4>
                      </div>

                      {/* Interactive slide summary */}
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">High-Yield Study Slide summary</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Remember, licensing exam questions love testing the **limiting steps** of this clinical physiological cycle.
                          Focus on the compensatory adjustments (e.g., changes in arterial bicarbonate or anion gap shifts) to safely pinpoint compound metabolic disorders.
                        </p>
                      </div>

                      {/* Associated Mini-Quiz to validate lectures */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-200">Instant Comprehension Check</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Which primary biochemical response counteracts this high-load state in the distal tubule cells?
                        </p>

                        <div className="space-y-2">
                          {[
                            "Direct potassium counter-transport via active pump channels",
                            "Carbonic anhydrase mediated reclamation of filtered bicarbonate ions",
                            "Accelerated cellular clearance of organic anions without threshold limits"
                          ].map((ans, idx) => (
                            <button
                              key={idx}
                              onClick={() => checkAnswer(idx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-[10px] font-semibold transition-colors flex justify-between items-center cursor-pointer ${
                                selectedQuizAnswer === idx 
                                  ? (quizState === "correct" ? "bg-emerald-950/40 border-emerald-500 text-emerald-300" : "bg-red-950/40 border-red-500 text-red-300")
                                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <span>{idx+1}. {ans}</span>
                              {selectedQuizAnswer === idx && (
                                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">
                                  {quizState === "correct" ? "CORRECT" : "TRY AGAIN"}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveLecture(null);
                          setActiveLectureSection(null);
                          setQuizState("none");
                        }}
                        className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                      >
                        ← Exit Lecture Study Room
                      </button>
                    </div>
                  ) : (
                    /* Default Syllabus Accordion */
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-[#003B95]" />
                          <span>Course Curriculum Syllabus</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {activeCourse.durationHours} Hours • {activeCourse.syllabus.length} Sections
                        </span>
                      </div>

                      <div className="space-y-3">
                        {activeCourse.syllabus.map((section, sIdx) => (
                          <div key={sIdx} className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-slate-50/50">
                            <div className="bg-slate-50 p-4 border-b border-[#E2E8F0] flex justify-between items-center">
                              <div>
                                <h5 className="text-xs font-bold text-slate-800">Section {sIdx+1}: {section.title}</h5>
                                <span className="text-[10px] text-slate-400 font-mono font-medium">{section.duration} duration</span>
                              </div>
                            </div>
                            <div className="p-3 bg-white divide-y divide-slate-100">
                              {section.lectures.map((lec, lIdx) => {
                                const enrollState = isEnrolled[activeCourse.id];
                                return (
                                  <div key={lIdx} className="py-2.5 px-1 flex justify-between items-center text-[11px] font-semibold text-slate-600">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Play className="h-3 w-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{lec}</span>
                                    </div>
                                    {enrollState ? (
                                      <button
                                        onClick={() => {
                                          setActiveLecture(lec);
                                          setActiveLectureSection(section.title);
                                        }}
                                        className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 py-1 px-2.5 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
                                      >
                                        Start Lecture
                                      </button>
                                    ) : (
                                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                                        Locked
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructor Bio Profile */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#64748B] block">INSTRUCTOR BIOGRAPHY</span>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-[#003B95] rounded-full flex items-center justify-center border border-blue-100 shrink-0 font-extrabold text-sm">
                        {activeCourse.instructorName[4] || "Dr"}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs md:text-sm">{activeCourse.instructorName}</h5>
                        <span className="text-[10px] font-bold text-[#003B95]">{activeCourse.instructorTitle} ({activeCourse.country})</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-2 font-medium">
                          Fully accredited board educator with years of residency training advisory, specializing in guiding international medical graduates to elite-tier clinical system matching.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Interactive Enroll checkout & Reviews */}
                <div className="md:col-span-5 p-6 bg-slate-50/50 flex flex-col justify-between space-y-6">
                  {/* Checkout & Value Card */}
                  <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800">CURRICULUM ACCESS</span>
                      <span className="text-lg font-black text-[#003B95] font-mono">
                        {activeCourse.price === 0 ? "FREE ACCESS" : `${activeCourse.price} ${activeCourse.currency}`}
                      </span>
                    </div>

                    {!isEnrolled[activeCourse.id] ? (
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Includes interactive study slide notes, associated mini quizzes, and direct messaging with **{activeCourse.instructorName}** for licensing questions.
                        </p>
                        <button
                          onClick={() => handleEnrollCourse(activeCourse.id)}
                          disabled={enrollingCourseId === activeCourse.id}
                          className="w-full bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>{enrollingCourseId === activeCourse.id ? "Securing Peer Checkout..." : "Enroll & Unlock Modules"}</span>
                        </button>
                        <span className="text-[8px] text-slate-400 font-semibold block text-center">
                          Secured via standard peer-to-peer developer billing logic. Fully refundable.
                        </span>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                        <span>Registered! All lectures are unlocked.</span>
                      </div>
                    )}
                  </div>

                  {/* Reviews lists */}
                  <div className="space-y-4 flex-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#64748B] block">TRAINEE REVIEWS & COMMENTS</span>
                    
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                      {activeCourse.reviews.map((rev, idx) => (
                        <div key={idx} className="bg-white border border-[#E2E8F0] p-3 rounded-xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-700">{rev.reviewer}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: rev.stars }).map((_, i) => (
                                <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">{rev.comment}</p>
                          <span className="text-[8px] text-slate-400 block font-mono text-right">{rev.date}</span>
                        </div>
                      ))}
                    </div>

                    {/* Write Review form */}
                    <form onSubmit={handleAddReview} className="bg-white p-4 border border-[#E2E8F0] rounded-2xl space-y-3">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 block">Submit Your Academy Review</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Your Name / Country"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-1.5 px-3 text-[11px] font-semibold text-slate-700 focus:outline-none"
                        />
                        <select
                          value={reviewStars}
                          onChange={(e) => setReviewStars(Number(e.target.value))}
                          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-1.5 px-3 text-[11px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value={5}>5 Stars ★★★★★</option>
                          <option value={4}>4 Stars ★★★★☆</option>
                          <option value={3}>3 Stars ★★★☆☆</option>
                          <option value={2}>2 Stars ★★☆☆☆</option>
                          <option value={1}>1 Star ★☆☆☆☆</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Add high-yield clinical feedback..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-1.5 px-3 text-[11px] font-semibold text-slate-700 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="bg-[#003B95] hover:bg-blue-950 text-white font-extrabold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                      >
                        {isSubmittingReview ? "Posting feedback..." : "Publish Review"}
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
