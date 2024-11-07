import axios from "axios";

const instance = axios.create({
    baseURL: 'https://api.alice-happymate.com',
    // baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
  
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            alert("토큰이 만료되었습니다. 다시 로그인해주세요");
            window.location.replace('/login')
        }
        return Promise.reject(error)
    }
)

export const setHeader = (token: string | null) => {
    if (token) {
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Authorization 헤더 설정:", instance.defaults.headers.common["Authorization"]); // 인증 헤더 로그 출력
    } else {
        delete instance.defaults.headers.common["Authorization"];
    }
};

// 페이지 로드 시 로컬스토리지에서 액세스 토큰을 가져와 설정
setHeader(localStorage.getItem('accessToken'));

instance.interceptors.response.use(
    (response) => response, // 성공한 응답을 그대로 반환
    async (error) => {
        if (!error.response) {
            console.error("서버 응답 없음:", error);
            return Promise.reject(new Error("서버 응답이 없습니다."));
        }

        const originalRequest = error.config;
        const { message, status } = error.response.data;

        console.log("오류 메시지:", message);

        if (status === 401 && message === "사용자 검증에 실패했습니다") {
            try {
                const res = await instance.post("/auth/refresh", { token: localStorage.getItem('refreshToken') });

                if (res.data.reAuthenticationRequired) {
                    throw new Error("토큰 재발급 실패");
                } else {
                    console.log("토큰 재발급 성공");
                    const newAccessToken: string = res.data.accessToken;
                    localStorage.setItem('accessToken', newAccessToken);
                    setHeader(newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    return instance(originalRequest);
                }
            } catch (err) {
                console.error("재발급 중 오류:", err);
                await instance.post("/auth/logout", { token: localStorage.getItem('refreshToken') });
                alert("로그인 정보가 만료되었습니다. 다시 로그인 해주세요.");
                localStorage.clear();
                window.location.replace('/');
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
        // const originalRequest = error.config;
        // const msg = error.response.data;
        // const status = error.response.status;
        // console.log(msg)

        // if (status === 401) {
        //     if (msg == "사용자 검증에 실패했습니다"){
        //         instance.post("/auth/refresh", {token:localStorage.getItem('refreshToken')})
        //             .then((res) => {
        //                 if (res.data.reAuthenticationRequired) {
        //                     throw new Error ("토큰 재발급 실패")
        //                 } else {
        //                     console.log("재발급성공")
        //                     const newAccessToken : string = res.data.accessToken
        //                     localStorage.setItem('accessToken', newAccessToken)
        //                     setHeader(newAccessToken)
        //                     originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        //                     return axios(originalRequest)
        //                 }
        //             })
        //             .catch((err) => {
        //                 instance.post("/auth/logout", {token:localStorage.getItem('refreshToken')})
        //                     .then(() => {
        //                         alert("로그인 정보가 만료되었습니다. 다시 로그인 해주세요")
        //                         localStorage.clear()
        //                         window.location.replace('/')
        //                     })
        //             })
        //     }
        // }
        // return Promise.reject(error)

    }
)

export default instance;