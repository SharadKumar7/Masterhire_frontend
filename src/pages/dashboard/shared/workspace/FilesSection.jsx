// ─── FilesSection.jsx ────────────────────────────────────────────────────────
// Shared for both client and freelancer — role prop controls section order
import React, { useState, useRef } from "react";
import { Upload, Download, File, Image, Video, FileText, Grid, List, X, Loader2 } from "lucide-react";
import { Spinner, ErrorBanner, BASE_URL, getToken } from "./Shared";

const getFileIcon = (fileType, name = "") => {
  if (fileType === "image"    || /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
    return <Image size={20} className="text-blue-500" />;
  if (fileType === "video"    || /\.(mp4|webm|mov)$/i.test(name))
    return <Video size={20} className="text-purple-500" />;
  if (fileType === "document" || /\.(pdf|doc|docx|txt|zip)$/i.test(name))
    return <FileText size={20} className="text-red-400" />;
  return <File size={20} className="text-gray-400" />;
};

const getFileBg = (fileType) => {
  if (fileType === "image")    return "bg-blue-50 border-blue-100";
  if (fileType === "video")    return "bg-purple-50 border-purple-100";
  if (fileType === "document") return "bg-red-50 border-red-100";
  return "bg-gray-50 border-gray-100";
};

const FileGrid = ({ files, view }) =>
  view === "grid" ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-5">
      {files.map((file, idx) => (
        <div key={idx}
          className={`relative border rounded-2xl p-4 flex flex-col items-center gap-2.5 group hover:shadow-md transition-all ${getFileBg(file.fileType)}`}
        >
          <div className="mt-1">
            {file.fileType === "image" ? (
              <img src={file.url} alt={file.name} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
            ) : (
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                {getFileIcon(file.fileType, file.name)}
              </div>
            )}
          </div>
          <p className="text-xs font-medium text-gray-700 text-center truncate w-full px-1">{file.name}</p>
          {file.size && <p className="text-[10px] text-gray-400">{file.size}</p>}
          <a href={file.url} download={file.name} target="_blank" rel="noreferrer"
            className="opacity-0 group-hover:opacity-100 transition w-full flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-teal-700 hover:bg-teal-50 text-xs font-semibold py-1.5 rounded-xl">
            <Download size={13} /> Download
          </a>
        </div>
      ))}
    </div>
  ) : (
    <div className="divide-y divide-gray-50">
      {files.map((file, idx) => (
        <div key={idx} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/70 transition group">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getFileBg(file.fileType)}`}>
              {getFileIcon(file.fileType, file.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
              {file.size && <p className="text-xs text-gray-400 mt-0.5">{file.size}</p>}
            </div>
          </div>
          <a href={file.url} download={file.name} target="_blank" rel="noreferrer"
            className="ml-4 flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 opacity-0 group-hover:opacity-100 transition bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg">
            <Download size={13} /> Download
          </a>
        </div>
      ))}
    </div>
  );

const EmptyFiles = ({ text }) => (
  <div className="w-full py-14 flex flex-col items-center justify-center gap-3">
    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
      <File size={20} className="text-gray-300" />
    </div>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

// ─── Upload Zone ──────────────────────────────────────────────────────────────
const UploadZone = ({ uploading, dragOver, onDragOver, onDragLeave, onDrop, onClick, fileInputRef, onFileChange, uploadError, onClearError }) => (
  <div className="space-y-3">
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
        ${dragOver ? "border-teal-400 bg-teal-50 scale-[1.01]" : "border-gray-200 bg-gray-50/50 hover:border-teal-300 hover:bg-teal-50/30"}`}
    >
      {uploading ? (
        <>
          <Loader2 size={28} className="text-teal-500 animate-spin" />
          <p className="text-sm font-semibold text-teal-700">Uploading files...</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
            <Upload size={20} className="text-teal-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              {dragOver ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              or <span className="text-teal-600 font-semibold underline underline-offset-2">click to browse</span>
              &nbsp;· Images, Videos, PDFs, Docs, ZIP up to 50MB
            </p>
          </div>
        </>
      )}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFileChange} />
    </div>
    {uploadError && (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
        <X size={16} /> {uploadError}
        <button onClick={onClearError} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const FilesSection = ({ data, loading, error, projectId, onUploadSuccess, role = "client" }) => {
  const [view, setView]               = useState("grid");
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const fileInputRef                  = useRef(null);

  if (loading) return <Spinner text="Loading files..." />;
  if (error)   return <ErrorBanner message={error} />;

  const allFiles        = data?.files || [];
  const clientFiles     = allFiles.filter((f) => f.uploaderRole === "client"     || f.source === "client");
  const freelancerFiles = allFiles.filter((f) => f.uploaderRole === "freelancer" || f.source === "milestone");

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      const res = await fetch(`${BASE_URL}/api/job/${projectId}/files`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      onUploadSuccess?.();
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const ViewToggle = () => (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      <button onClick={() => setView("grid")}
        className={`p-1.5 rounded-md transition ${view === "grid" ? "bg-white shadow-sm text-teal-600" : "text-gray-400 hover:text-gray-600"}`}>
        <Grid size={15} />
      </button>
      <button onClick={() => setView("list")}
        className={`p-1.5 rounded-md transition ${view === "list" ? "bg-white shadow-sm text-teal-600" : "text-gray-400 hover:text-gray-600"}`}>
        <List size={15} />
      </button>
    </div>
  );

  // ── My Upload Section (the logged-in user's own files + upload zone) ─────────
  const MyUploadSection = ({ title, desc, files, emptyText }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
        <ViewToggle />
      </div>

      <UploadZone
        uploading={uploading}
        dragOver={dragOver}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        onFileChange={(e) => handleUpload(e.target.files)}
        uploadError={uploadError}
        onClearError={() => setUploadError(null)}
      />

      {files.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-500">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </p>
          </div>
          <FileGrid files={files} view={view} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <EmptyFiles text={emptyText} />
        </div>
      )}
    </div>
  );

  // ── Other person's files (read only, no upload) ───────────────────────────
  const OtherFilesSection = ({ title, desc, files, emptyText }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
        <ViewToggle />
      </div>

      {files.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-500">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </p>
          </div>
          <FileGrid files={files} view={view} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 overflow-hidden">
          <EmptyFiles text={emptyText} />
        </div>
      )}
    </div>
  );

  return (
    <div className="py-6 space-y-8">
      {role === "client" ? (
        <>
          {/* CLIENT — upar apna upload, neeche freelancer deliverables */}
          <MyUploadSection
            title="Your Files"
            desc="Files you have uploaded for this project"
            files={clientFiles}
            emptyText="You haven't uploaded any files yet"
          />
          <div className="border-t border-gray-100" />
          <OtherFilesSection
            title="Freelancer Deliverables"
            desc="Files submitted by the freelancer as work deliverables"
            files={freelancerFiles}
            emptyText="No deliverables submitted yet — freelancer's work will appear here"
          />
        </>
      ) : (
        <>
          {/* FREELANCER — upar apna upload, neeche client files */}
          <MyUploadSection
            title="Your Deliverables"
            desc="Upload your work files for the client to review"
            files={freelancerFiles}
            emptyText="You haven't uploaded any deliverables yet"
          />
          <div className="border-t border-gray-100" />
          <OtherFilesSection
            title="Client Files"
            desc="Files shared by the client for this project"
            files={clientFiles}
            emptyText="No files shared by client yet"
          />
        </>
      )}
    </div>
  );
};

export default FilesSection;