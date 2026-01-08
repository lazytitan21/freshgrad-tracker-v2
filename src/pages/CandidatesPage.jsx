import React, { useState, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useStore } from "../providers/StoreProvider";
import { useToast } from "../components/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { classNames, computeFinalAverage, statusBadgeColor } from "../utils/helpers";
import { Search, Filter, MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react";

export default function CandidatesPage({ role, onOpenCandidate, onEditCandidate }){
  const { candidates, deleteCandidate: deleteCandidateAPI, logEvent, courses } = useStore();
  const toast = useToast();
  const { confirmDelete } = useConfirm();
  const [q,setQ]=useState(""); const [statusFilter,setStatusFilter]=useState("");

  const rows = useMemo(()=> candidates.filter(c=>{
    const s=q.toLowerCase();
    const hit = String(c.id).toLowerCase().includes(s) || String(c.name).toLowerCase().includes(s) || String(c.email).toLowerCase().includes(s) || String(c.subject).toLowerCase().includes(s) || String(c.emirate).toLowerCase().includes(s);
    const ok = !statusFilter || c.status===statusFilter; return hit && ok;
  }),[q,statusFilter,candidates]);

  async function deleteCandidate(id){
    const confirmed = await confirmDelete("this candidate");
    if (!confirmed) return;
    try {
      await deleteCandidateAPI(id);
      logEvent("candidate_deleted",{ id, ts:new Date().toISOString() });
      toast.success("Candidate deleted successfully");
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      toast.error("Failed to delete candidate. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-sm text-muted mt-1">Manage and track all training candidates</p>
        </div>
        <div className="text-sm text-muted">
          Showing <span className="font-semibold text-slate-900">{rows.length}</span> of {candidates.length} candidates
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder="Search by ID, name, email, subject, or emirate..." 
            className="form-input pl-11 w-full" 
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select 
            value={statusFilter} 
            onChange={e=>setStatusFilter(e.target.value)} 
            className="form-input py-2.5"
          >
            <option value="">All Statuses</option>
            <optgroup label="Pipeline">
              { ["Imported","Eligible","Assigned","In Training","Courses Completed","Assessed","Graduated","Ready for Hiring","Hired/Closed"].map(s=><option key={s} value={s}>{s}</option>) }
            </optgroup>
            <optgroup label="Exceptions">
              { ["On Hold","Withdrawn","Rejected"].map(s=><option key={s} value={s}>{s}</option>) }
            </optgroup>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border panel shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-24">ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Emirate</th>
                <th className="text-center">GPA</th>
                <th className="text-center">Status</th>
                <th className="text-center">Progress</th>
                <th>Sponsor</th>
                <th className="text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {rows.map((c, idx) => {
                  const finalAvg = computeFinalAverage(c, courses);
                  return (
                    <Motion.tr 
                      key={c.id} 
                      initial={{opacity:0}} 
                      animate={{opacity:1}} 
                      exit={{opacity:0}} 
                      transition={{duration:0.15}}
                      className="group"
                    >
                      <td className="font-mono text-xs">{c.id}</td>
                      <td>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted truncate max-w-[200px]">{c.email}</div>
                      </td>
                      <td>{c.subject}</td>
                      <td>{c.emirate}</td>
                      <td className="text-center">
                        <span className="font-semibold">{Number(c.gpa).toFixed(2)}</span>
                      </td>
                      <td className="text-center">
                        <span className={classNames("badge", statusBadgeColor(c.status))}>
                          {c.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={classNames(
                          "font-semibold",
                          finalAvg !== null && finalAvg >= 70 ? "text-emerald-600" : "text-slate-500"
                        )}>
                          {finalAvg ?? "—"}
                        </span>
                      </td>
                      <td>{c.sponsor || "—"}</td>
                      <td>
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={()=>onOpenCandidate?.(c.id)} 
                            className="btn-ghost p-2 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {(role==="Admin" || role==="Super Admin") && (
                            <>
                              <button 
                                onClick={()=>onEditCandidate?.(c.id)} 
                                className="btn-ghost p-2 rounded-lg"
                                title="Edit Candidate"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={()=>deleteCandidate(c.id)} 
                                className="btn-ghost p-2 rounded-lg text-red-600 hover:bg-red-50"
                                title="Delete Candidate"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </Motion.tr>
                  );
                })}
              </AnimatePresence>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="text-slate-400">
                      <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No candidates found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
