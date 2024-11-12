
export interface MemberSummary extends MemberServey {
    id: number,
    loginId: string,
    name: string,
    phoneNumber: string,
    measureState:string
}
 
interface MemberServey {
    degree: number,
    situation: number
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
        degree: member.degree,
        situation: member.situation,
        measureState : member.measureState
    }));
}

export function patchMembers(details: MemberDetails[]): MemberSummary[] {
    return details.map(data => ({
        id: data.member.id,
        loginId: data.member.loginId,
        name: data.member.name,
        phoneNumber: data.member.phoneNumber,
        degree : data.survey.degree,
        situation : data.survey.situation,
        measureState : data.measureState
    }));
}