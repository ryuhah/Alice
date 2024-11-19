function formatDate(isoString: string | null | undefined, addHours: number = 0): string {
    if (!isoString) {
        return '-'; // null 또는 undefined인 경우
    }

    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return '-'; // 유효하지 않은 날짜
    }
     // 필요한 경우 시간 더하기
     if (addHours !== 0) {
        date.setHours(date.getHours() + addHours);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


export interface MemberSummary extends MemberServey {
    id: number,
    loginId: string,
    name: string,
    phoneNumber: string,
    measureState:string,
    uploadTs: string
}
 
interface MemberServey {
    degree: number,
    situation: string
    surveyTs: string
}

interface MemberDetails {
    member: MemberSummary,
    survey: MemberServey,
    measureState:string
}

export interface FileList {
    name: string,
    loginId: string,
    date: string,
    size: string,
    fileName: string
}

export function initMembers(data: MemberSummary[]): MemberSummary[] {
    return data.map(member => ({
        id: member.id,
        loginId: member.loginId,
        name: member.name,
        phoneNumber: member.phoneNumber,
        uploadTs : formatDate(member.uploadTs, 9),
        degree: member.degree,
        situation: member.situation,
        surveyTs : formatDate(member.surveyTs),
        measureState : member.measureState
    }));
}

export function patchMembers(details: MemberDetails[]): MemberSummary[] {
    return details.map(data => ({
        id: data.member.id,
        loginId: data.member.loginId,
        name: data.member.name,
        phoneNumber: data.member.phoneNumber,
        uploadTs:formatDate(data.member.uploadTs,9),
        degree : data.survey.degree,
        situation : data.survey.situation,
        surveyTs : formatDate(data.survey.surveyTs),
        measureState : data.measureState
    }));
}