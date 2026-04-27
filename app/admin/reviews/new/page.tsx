import ReviewForm from "../ReviewForm";

export default function NewReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">후기 등록</h1>
        <p className="text-slate-500 text-sm mt-1">새로운 고객 출고 후기를 등록합니다.</p>
      </div>
      <ReviewForm />
    </div>
  );
}
