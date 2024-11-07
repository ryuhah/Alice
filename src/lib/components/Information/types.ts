import { MemberSummary } from "../Member/types";

export interface MemberCondition {
    id: number,
    loginId: string,
    name: string,
    condition: string
}  

export function initCondition(data: MemberSummary[]): MemberCondition[] {
    return data.map(member => ({
        id: member.id,
        loginId: member.loginId,
        name: member.name,
        condition: "NOT_MEASUREMENT"
    }));
}

export function patchCondition(conditions: MemberCondition[]): MemberCondition[] {
    return conditions.map(data => ({
        id: data.id,
        loginId: data.loginId,
        name: data.name,
        condition: data.condition,
    }));
}