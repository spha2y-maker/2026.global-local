import React, { useState, useRef } from 'react';
import { 
  Award, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Trash2, 
  Send, 
  AlertCircle,
  Clock,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PLACES_DATA } from '../data/travelData';
import { WorkbookEntry, StudentUser } from '../types';

interface StampTourViewProps {
  currentUser: StudentUser | null;
  entries: Record<string, WorkbookEntry>;
  onUpdateEntry: (placeId: string, updated: Partial<WorkbookEntry>) => void;
  onSubmitAllStamps: () => Promise<void>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  onOpenLogin: () => void;
}

export const StampTourView: React.FC<StampTourViewProps> = ({
  currentUser,
  entries,
  onUpdateEntry,
  onSubmitAllStamps,
  isSubmitting,
  isSubmitted,
  onOpenLogin
}) => {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedCount = PLACES_DATA.filter((p) => entries[p.id]?.stampAcquired).length;
  const isAllCompleted = completedCount === PLACES_DATA.length;

  const handleFileChange = (placeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read and compress image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 900;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const timestamp = new Date().toLocaleString('ko-KR', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        // Stamp is acquired ONLY upon attaching authentic photo!
        onUpdateEntry(placeId, {
          photoUrl: compressedDataUrl,
          stampAcquired: true,
          stampedAt: timestamp
        });

        // Visual stamp confetti effect
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('인증 사진을 삭제하면 스탬프가 취소됩니다. 계속하시겠습니까?')) {
      onUpdateEntry(placeId, {
        photoUrl: undefined,
        stampAcquired: false,
        stampedAt: undefined
      });
    }
  };

  const triggerUpload = (placeId: string) => {
    setSelectedPlaceId(placeId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!isAllCompleted) {
      alert('8대 탐방지의 인증 사진을 모두 첨부하여 스탬프를 완성해야 제출할 수 있습니다.');
      return;
    }

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });

    await onSubmitAllStamps();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (selectedPlaceId) {
            handleFileChange(selectedPlaceId, e);
          }
        }}
      />

      {/* Hero Banner with Bright Stamp Counter */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white border border-emerald-200/90 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>담양여자중학교 스탬프 랠리</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              2026. 글로컬 죽향 역사문화탐방 8대 스탬프 랠리
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              각 방문지 현장에서 미션 규정에 맞는 인증 사진을 촬영하여 첨부하세요. 
              사진이 확인되면 디지털 스탬프가 날인되며, 8개를 모두 완성하면 인솔 선생님께 실시간 제출됩니다.
            </p>
          </div>

          {/* Circular Progress Meter */}
          <div className="flex items-center gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs">
            <div className="relative w-18 h-18 flex items-center justify-center">
              <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-600 transition-all duration-700 ease-out"
                  strokeDasharray={`${(completedCount / 8) * 100}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-bold text-slate-900 font-mono">{completedCount}</span>
                <span className="text-xs text-slate-400 font-mono">/8</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700">
                스탬프 획득 현황
              </div>
              <div className="text-xs text-emerald-700 font-mono font-bold mt-0.5">
                진행률: {Math.round((completedCount / 8) * 100)}%
              </div>

              {isAllCompleted ? (
                <div className="mt-1.5 text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 8대 스탬프 올클리어!
                </div>
              ) : (
                <div className="mt-1.5 text-[11px] text-amber-700 font-medium">
                  남은 스탬프: {8 - completedCount}개
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Submit Action Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isSubmitted
                ? '✅ 이미 인솔교사에게 제출 완료되었습니다. (추가 수정 시 자동 동기화됩니다)'
                : isAllCompleted
                ? '🎉 축하합니다! 모든 스탬프가 찍혔습니다. 아래 버튼을 눌러 인솔 선생님께 제출하세요.'
                : '💡 현장에서 찍은 모둠원 사진을 각 장소 카드에 등록해 주세요.'}
            </span>
          </div>

          <button
            disabled={!isAllCompleted || isSubmitting}
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
              isSubmitted
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                : isAllCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>교사 관리실로 전송 중...</span>
              </>
            ) : isSubmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>제출 완료 (선생님 실시간 알림 수신됨)</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>스탬프 완성본 선생님께 실시간 제출하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 8-Grid Mission Stamp Rally */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🏆 미션 스탬프 랠리 8대 거점</span>
            <span className="text-xs text-slate-500 font-normal hidden sm:inline">(인증샷 첨부 시 스탬프 활성화)</span>
          </h3>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full border border-emerald-200 font-mono font-bold">
            {completedCount} / {PLACES_DATA.length} 완료
          </span>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {PLACES_DATA.map((p) => {
            const isStamped = entries[p.id]?.stampAcquired;
            return (
              <div
                key={p.id}
                onClick={() => triggerUpload(p.id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl cursor-pointer transition-all ${
                  isStamped
                    ? 'bg-emerald-50 border border-emerald-300'
                    : 'bg-slate-50 border border-slate-200 border-dashed hover:border-emerald-300'
                }`}
              >
                <div className={`w-11 h-11 flex items-center justify-center text-xl rounded-full ${
                  isStamped 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {p.emoji}
                </div>
                <span className={`text-[10px] text-center truncate w-full ${isStamped ? 'font-bold text-emerald-800' : 'text-slate-500'}`}>
                  {p.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8 Places Stamp Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLACES_DATA.map((place, index) => {
          const entry = entries[place.id];
          const isStamped = !!entry?.stampAcquired;

          return (
            <div
              key={place.id}
              className={`relative rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between bg-white shadow-xs ${
                isStamped
                  ? 'border-emerald-300 ring-2 ring-emerald-100'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              {/* Header with Place Image / Thumbnail */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                {entry?.photoUrl ? (
                  <>
                    <img
                      src={entry.photoUrl}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewImage(entry.photoUrl!)}
                        className="p-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 text-xs flex items-center gap-1 font-medium shadow-xs"
                      >
                        <Eye className="w-4 h-4 text-emerald-600" /> 크게보기
                      </button>
                      <button
                        onClick={(e) => handleRemovePhoto(place.id, e)}
                        className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs flex items-center gap-1 font-medium shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" /> 삭제
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={place.image}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-75 contrast-110"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/40 backdrop-blur-[2px]">
                      <span className="text-3xl mb-1">{place.emoji}</span>
                      <span className="text-xs text-white font-bold">인증 사진 미등록</span>
                      <span className="text-[10px] text-slate-200 mt-1">현장 사진 첨부 시 스탬프 활성화</span>
                    </div>
                  </>
                )}

                {/* Day Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-mono font-bold border border-slate-200 shadow-2xs">
                    DAY {place.day}
                  </span>
                </div>

                {/* STAMP EMBLEM OVERLAY (when stamped!) */}
                {isStamped && (
                  <div className="absolute -bottom-4 -right-4 z-20 pointer-events-none transform rotate-[-14deg]">
                    <div className="relative w-28 h-28 rounded-full border-4 border-dashed border-red-500 bg-red-50/95 backdrop-blur-xs flex flex-col items-center justify-center text-center p-2 text-red-600 shadow-lg animate-in zoom-in-50 duration-300">
                      <div className="text-[8px] font-black tracking-widest uppercase text-red-700">
                        담양여중 죽향
                      </div>
                      <div className="text-xs font-black tracking-tighter text-red-600 border-y border-red-300 py-0.5 my-0.5 w-full">
                        탐방 인증
                      </div>
                      <div className="text-[8px] font-mono text-red-600 font-semibold">
                        {entry.stampedAt || '2026.10'}
                      </div>
                      <div className="text-[7px] text-red-700 font-bold">
                        VERIFIED ★
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">NO. 0{index + 1}</span>
                    <span className="text-[11px] text-slate-400">{place.chineseName}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {place.name}
                  </h3>

                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                    <div className="text-slate-800 font-semibold mb-0.5 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-600" />
                      인증 미션:
                    </div>
                    {place.stampPhotoRequirement}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div>
                  {isStamped ? (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 스탬프 날인 완료
                      </span>
                      <button
                        onClick={() => triggerUpload(place.id)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 underline underline-offset-2 font-medium"
                      >
                        사진 다시찍기
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => triggerUpload(place.id)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition transform active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>인증 사진 첨부하기</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Fullscreen Photo Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="인증 사진 확대" className="max-h-[80vh] w-auto object-contain mx-auto" />
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-700">
              <span className="font-medium">담양여자중학교 현장 사진 인증 확인</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
