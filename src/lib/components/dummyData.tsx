export const dummyData = Array.from({ length: 50 }, (_, index) => ({
    no: index + 1,
    id: `user${index + 1}`,
    name: `사용자${index + 1}`,
    phone: `010-1234-567${index % 10}`,
    location: `위치${index + 1}`,
    stress: (Math.random() * 10).toFixed(0),
    depression: (Math.random() * 10).toFixed(0),
    heartEvent: `000`,
    spo2: `${95 + (index % 5)}`,
    hr: 60 + (index % 40),
    step: 600 + (index % 40),
    status: ['양호', '주의', '위험', '미측정'][index % 4],
    date: `23.09.0${index % 10}`,
    physicalHealth : (Math.random() * 10).toFixed(1),
    mentalHealth : (Math.random() * 10).toFixed(1),
    wellnessScore : (Math.random() * 10).toFixed(1),
    recovery : (Math.random() * 10).toFixed(0)
}));
