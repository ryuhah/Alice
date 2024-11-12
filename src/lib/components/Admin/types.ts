export interface AdminInfo {
    id: number;
    loginId: string;
    name: string;
    gender: string;
    age: number;
    phoneNumber: string;
}

export interface AddAdmin {
    loginId: string;
    password : string;
    name: string;
    phoneNumber: string;
    gender: string;
    age: number;
}

export interface MemberInfo {
    id: number;
    loginId: string;
    name: string;
    phoneNumber: string;
}


// 인증 요청 시 사용할 타입 정의
export type ActionType = 'addUser' | 'deleteUser' | 'addAdmin' | 'deleteAdmin' |null;

export function initMembers(data: any[]): MemberInfo[] {
    return data.map(member => ({
        id: member.id,
        loginId: member.loginId,
        name: member.name,
        phoneNumber: member.phoneNumber
    }));
}

export function initAdmins(data:any[]): AdminInfo[] {
    return data.map(admin => ({
        id : admin.id,
        loginId : admin.loginId,
        name : admin.name,
        gender : admin.gender,
        age : admin.age,
        phoneNumber : admin.phoneNumber
    }))
}