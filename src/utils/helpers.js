import * as XLSX from "xlsx";

export const classNames = (...a) => a.filter(Boolean).join(" ");

export function exportXLSX(filename, rows, headers, sheetName = "Sheet1") {
  const hdr = headers.map(h => h.label ?? h.key);
  const aoa = [hdr, ...rows.map(r => headers.map(h => r[h.key] ?? ""))];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export function subjectToTrackId(subj){ return (subj==="Arabic"||subj==="English") ? "t2" : (subj==="Computer Science"?"t3":"t1"); }
export const emailRe  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
export const mobileRe = /^(?:\+9715\d{8}|05\d{8})$/;

export function requiredCoursesForTrack(courses, trackId){
  return (courses||[]).filter(c => c.active !== false && c.isRequired && c.tracks?.includes(trackId));
}
export function courseByCode(courses, code){ return (courses||[]).find(c => c.code === code); }

// Basic track list mirrored from App.jsx to provide track name lookup in shared helpers
export const TRACKS = [
  { id: "t1", name: "STEM Core",  minAverage: 70 },
  { id: "t2", name: "Languages",  minAverage: 75 },
  { id: "t3", name: "ICT",        minAverage: 70 },
];
export function trackNameById(id){ return TRACKS.find(t=>t.id===id)?.name || "—"; }

export function computeFinalAverage(candidate, courses){
  if (!candidate) return null;
  const req = requiredCoursesForTrack(courses, candidate.trackId);
  if (!req.length) return null;
  let sum=0, wsum=0;
  req.forEach(course=>{
    const w = typeof course.weight==="number" && course.weight>0 ? course.weight : 1;
    const cr = (candidate.courseResults||[]).find(x => x.code === course.code);
    if (cr && typeof cr.score==="number") { sum += cr.score * w; wsum += w; }
  });
  return wsum>0 ? Math.round((sum/wsum)*10)/10 : null;
}

// Compute current average from all course results (shows progress even if incomplete)
export function computeCurrentAverage(candidate, courses){
  if (!candidate) return null;
  const results = candidate.courseResults || [];
  if (!results.length) return null;
  let sum = 0, count = 0;
  results.forEach(cr => {
    if (typeof cr.score === "number") {
      const course = (courses || []).find(c => c.code === cr.code);
      const weight = course && typeof course.weight === "number" && course.weight > 0 ? course.weight : 1;
      sum += cr.score * weight;
      count += weight;
    }
  });
  return count > 0 ? Math.round((sum / count) * 10) / 10 : null;
}

export function coursePassed(candidate, course){
  const cr = (candidate.courseResults||[]).find(x => x.code===course.code);
  if (!cr) return false;
  const th = typeof course.passThreshold==="number" ? course.passThreshold : 70;
  return Number(cr.score) >= th;
}

export function statusBadgeColor(status){
  // Professional status badge styling using design system
  const map = {
    // Pipeline stages
    Imported: "badge-neutral",
    Eligible: "badge-info",
    Assigned: "badge-primary",
    "In Training": "badge-warning",
    "Courses Completed": "badge-success",
    Assessed: "bg-teal-50 text-teal-700 ring-1 ring-teal-600/20",
    Graduated: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    "Ready for Hiring": "bg-lime-50 text-lime-700 ring-1 ring-lime-600/20",
    "Hired/Closed": "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20",
    // Exception statuses
    "On Hold": "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
    Withdrawn: "badge-error",
    Rejected: "badge-error",
  };
  return map[status] || "badge-neutral";
}

export function parseCSV(text){
  const rows = []; let cur="", row=[], inQuotes=false;
  for (let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){ if(inQuotes && text[i+1]==='"'){ cur+='"'; i++; } else inQuotes=!inQuotes; }
    else if(ch===',' && !inQuotes){ row.push(cur); cur=''; }
    else {
      const code=ch.charCodeAt(0);
      if(!inQuotes && (code===10||code===13)){ row.push(cur); rows.push(row.slice()); cur=''; row.length=0; if(code===13&&text.charCodeAt(i+1)===10) i++; }
      else cur+=ch;
    }
  }
  if(cur!==' '||row.length){ row.push(cur); rows.push(row); }
  return rows.filter(r=>r.length && r.some(x=>x!==''));
}

export function isRequiredForCandidate(code, candidate, courses) {
  if (String(code).toUpperCase() === "INTERN") return "Required";
  const c = (courses || []).find(k => k.code === code);
  if (!c) return "Optional";
  const req = !!c.isRequired && (c.tracks || []).includes(candidate.trackId);
  return req ? "Required" : "Optional";
}

export function statusToMainStageIndex(status) {
  const map = {
    "Imported": 0, "Eligible": 0,
    "Assigned": 1, "On Hold": 1,
    "In Training": 2, "Courses Completed": 2, "Assessed": 2,
    "Graduated": 3,
    "Ready for Hiring": 4, "Hired/Closed": 4,
    "Withdrawn": 0, "Rejected": 0
  };
  return (status in map) ? map[status] : 0;
}
