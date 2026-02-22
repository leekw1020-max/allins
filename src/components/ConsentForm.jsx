import React, { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { CheckSquare, Square, Search, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ConsentForm() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        zonecode: '',
        address: '',
        detailAddress: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [showPostcode, setShowPostcode] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        setFormData({
            ...formData,
            zonecode: data.zonecode,
            address: fullAddress,
        });
        setErrors({ ...errors, address: null });
        setShowPostcode(false);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요.';
        if (!formData.phone.trim()) newErrors.phone = '연락처를 입력해주세요.';
        if (!formData.address.trim()) newErrors.address = '주소를 검색해주세요.';
        if (!agreed) newErrors.agreed = '개인정보 수집 및 이용에 동의해야 합니다.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            if (!supabase) {
                // Fallback for demo when Supabase is not configured
                console.warn('Supabase not configured. Mock submission:', formData);
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSubmitStatus('success');
                return;
            }

            const { error } = await supabase
                .from('consents')
                .insert([
                    {
                        name: formData.name,
                        phone: formData.phone,
                        zonecode: formData.zonecode,
                        address: formData.address,
                        detail_address: formData.detailAddress,
                        agreed: agreed,
                    }
                ]);

            if (error) throw error;
            setSubmitStatus('success');
        } catch (err) {
            console.error('Submission error:', err);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return (
            <div className="w-full max-w-md mx-auto bg-white min-h-screen sm:min-h-0 sm:mt-10 sm:rounded-xl sm:shadow-lg flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">제출 완료</h2>
                <p className="text-gray-600 mb-8">개인정보 제공 동의가 성공적으로 완료되었습니다. 감사합니다.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-navy-600 hover:bg-navy-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                    돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white min-h-screen sm:min-h-0 sm:mt-10 sm:rounded-xl sm:shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-navy-900 text-white p-6 pb-8 rounded-b-3xl sm:rounded-none">
                <h1 className="text-2xl font-bold mb-2">개인정보 제공 동의</h1>
                <p className="text-navy-100 text-sm opacity-90">
                    원활한 서비스 제공을 위해 아래 정보를 입력해주세요.
                </p>
            </div>

            {/* Form Content */}
            <div className="flex-1 p-6 relative -mt-4 bg-white rounded-t-3xl sm:rounded-none sm:mt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="홍길동"
                            className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 transition-colors bg-gray-50`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="010-0000-0000"
                            className={`w-full p-3 rounded-lg border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 transition-colors bg-gray-50`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Address Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={formData.zonecode}
                                readOnly
                                placeholder="우편번호"
                                className={`flex-1 p-3 rounded-lg border ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'} bg-gray-50 focus:outline-none text-gray-600`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPostcode(true)}
                                className="bg-navy-800 text-white px-4 rounded-lg flex items-center gap-2 hover:bg-navy-900 transition-colors font-medium text-sm"
                            >
                                <Search size={16} />
                                주소검색
                            </button>
                        </div>
                        <input
                            type="text"
                            value={formData.address}
                            readOnly
                            placeholder="기본 주소"
                            className={`w-full p-3 rounded-lg border ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'} mb-2 bg-gray-50 focus:outline-none text-gray-600`}
                        />
                        <input
                            type="text"
                            name="detailAddress"
                            value={formData.detailAddress}
                            onChange={handleChange}
                            placeholder="상세 주소 (동, 호수)"
                            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 transition-colors bg-gray-50"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* Privacy Consent */}
                    <div className="pt-4 border-t border-gray-100 mt-8">
                        <button
                            type="button"
                            onClick={() => {
                                setAgreed(!agreed);
                                if (errors.agreed) setErrors({ ...errors, agreed: null });
                            }}
                            className="flex items-start gap-3 w-full text-left focus:outline-none group pb-2"
                        >
                            <div className={`mt-0.5 flex-shrink-0 ${agreed ? 'text-navy-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                {agreed ? <CheckSquare size={22} className="fill-navy-50" /> : <Square size={22} />}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-800 flex flex-wrap gap-1 text-[15px]">
                                    (필수) 개인정보 수집 및 이용 동의
                                </span>
                                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100">
                                    ㈜올인스는 고객 상담 및 안내를 위해 위 개인정보를 수집하며, 관계 법령에 따라 안전하게 보관 및 관리합니다.
                                </p>
                                {errors.agreed && <p className="text-red-500 text-xs mt-2">{errors.agreed}</p>}
                            </div>
                        </button>
                    </div>

                    {/* Submit Button */}
                    {submitStatus === 'error' && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
                            오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-navy-600 hover:bg-navy-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg mt-6 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                처리 중...
                            </>
                        ) : (
                            '동의하고 제출하기'
                        )}
                    </button>
                </form>
            </div>

            {/* Postcode Modal */}
            {showPostcode && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
                            <h3 className="font-semibold">주소 검색</h3>
                            <button onClick={() => setShowPostcode(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="h-[400px]">
                            <DaumPostcode onComplete={handleComplete} style={{ height: '400px' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
