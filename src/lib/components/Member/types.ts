
export interface MemberSummary extends MemberVitals {
    id: number,
    loginId: string,
    name: string,
    phoneNumber: string,
    supervisorPhoneNumber: string,
    gpsLocation: string
}
 
interface MemberVitals {
    stress?: number,
    depress?: number,
    abnormalHr?: number,
    spo2?: number,
    hr?: number,
    step?: number,
    recovery?: number,
    skinTemp?: number,
    bodyTemp?: number,
}

interface MemberDetails {
    member: MemberSummary,
    vital: MemberVitals
}

export function initMembers(data: MemberSummary[]): MemberSummary[] {
    return data.map(member => ({
        id: member.id,
        loginId: member.loginId,
        name: member.name,
        phoneNumber: member.phoneNumber,
        supervisorPhoneNumber: member.supervisorPhoneNumber,
        gpsLocation: member.gpsLocation,
        stress: 0,
        depress: 0,
        abnormalHr: 0,
        spo2: 0,
        hr: 0,
        step: 0,
        recovery: 0,
        skinTemp: 0,
        bodyTemp: 0,
    }));
}

export function patchMembers(details: MemberDetails[]): MemberSummary[] {
    return details.map(data => ({
        id: data.member.id,
        loginId: data.member.loginId,
        name: data.member.name,
        phoneNumber: data.member.phoneNumber,
        supervisorPhoneNumber: data.member.supervisorPhoneNumber,
        gpsLocation: data.member.gpsLocation,
        stress: data.vital.stress,
        depress: data.vital.depress,
        abnormalHr: data.vital.abnormalHr,
        spo2: data.vital.spo2,
        hr: data.vital.hr,
        step: data.vital.step,
        recovery: data.vital.recovery,
        skinTemp: data.vital.skinTemp,
        bodyTemp: data.vital.bodyTemp
    }));
}