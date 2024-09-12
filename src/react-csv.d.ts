// typescript에서 react-csv사용을 위한 파일

declare module 'react-csv' {
    export const CSVLink: React.FC<any>;
    export const CSVDownload: React.FC<any>;
}
