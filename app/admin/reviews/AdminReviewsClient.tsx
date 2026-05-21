"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  carModel: string;
  customerName: string;
  plannerName: string | null;
  contractDate: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AdminReviewsClient({ reviews: initialReviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Review>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("이 후기를 삭제하시겠습니까?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
      } else {
        alert("삭제 실패");
      }
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditData({
      title: review.title,
      content: review.content,
      customerName: review.customerName,
      plannerName: review.plannerName || "",
      carModel: review.carModel,
      isPublished: review.isPublished,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editData }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews(prev =>
          prev.map(r =>
            r.id === editingId
              ? { ...r, ...editData, contractDate: updated.contractDate }
              : r
          )
        );
        setEditingId(null);
        setEditData({});
      } else {
        alert("저장 실패");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (review: Review) => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id, isPublished: !review.isPublished }),
    });
    if (res.ok) {
      setReviews(prev =>
        prev.map(r =>
          r.id === review.id ? { ...r, isPublished: !r.isPublished } : r
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">후기 수정</h2>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">제목</label>
              <input
                value={editData.title || ""}
                onChange={e => setEditData({ ...editData, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">내용</label>
              <textarea
                value={editData.content || ""}
                onChange={e => setEditData({ ...editData, content: e.target.value })}
                rows={4}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">고객명</label>
                <input
                  value={editData.customerName || ""}
                  onChange={e => setEditData({ ...editData, customerName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">담당 플래너</label>
                <input
                  value={editData.plannerName || ""}
                  onChange={e => setEditData({ ...editData, plannerName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">차종</label>
              <input
                value={editData.carModel || ""}
                onChange={e => setEditData({ ...editData, carModel: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editData.isPublished ?? true}
                onChange={e => setEditData({ ...editData, isPublished: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm text-slate-600">공개</label>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-[#0a2540] text-white rounded-lg text-sm font-bold hover:bg-[#143a66] transition-colors disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              <button
                onClick={() => { setEditingId(null); setEditData({}); }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${
              !review.isPublished ? "opacity-60 border-slate-200" : "border-slate-100"
            }`}
          >
            {/* Thumbnail */}
            {review.thumbnailUrl && (
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                <img
                  src={review.thumbnailUrl}
                  alt={review.title}
                  className="w-full h-full object-cover"
                />
                {!review.isPublished && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    비공개
                  </div>
                )}
              </div>
            )}
            {!review.thumbnailUrl && (
              <div className="h-16 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <span className="text-slate-300 text-xs">이미지 없음</span>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-sm text-slate-800 line-clamp-1 mb-1">{review.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{review.content}</p>
              
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <span>{review.customerName}</span>
                {review.plannerName && (
                  <>
                    <span>·</span>
                    <span className="text-blue-500">{review.plannerName}</span>
                  </>
                )}
                <span>·</span>
                <span suppressHydrationWarning>{new Date(review.contractDate).toLocaleDateString("ko-KR")}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleEdit(review)}
                  className="flex-1 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleTogglePublish(review)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    review.isPublished
                      ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {review.isPublished ? "비공개" : "공개"}
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={deleting === review.id}
                  className="flex-1 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {deleting === review.id ? "..." : "삭제"}
                </button>
                {review.sourceUrl && (
                  <a
                    href={review.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 bg-blue-50 text-blue-500 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    원본
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-4">📝</p>
          <p>등록된 후기가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
