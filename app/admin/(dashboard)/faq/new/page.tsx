import FaqForm from "../FaqForm";

export default function NewFaqPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">FAQ 등록</h1>
        <p className="text-slate-500 text-sm mt-1">자주 묻는 질문을 추가합니다.</p>
      </div>
      <FaqForm />
    </div>
  );
}
