import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Member {
  id: string;
  condition: string;
}

interface State {
  dangerousMembers: Member[];
}

const initialState: State = {
  dangerousMembers: [],
};

type Action =
  | { type: 'ADD_DANGEROUS_MEMBER'; member: Member }
  | { type: 'REMOVE_DANGEROUS_MEMBER'; memberId: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_DANGEROUS_MEMBER':
      return { ...state, dangerousMembers: [...state.dangerousMembers, action.member] };
    case 'REMOVE_DANGEROUS_MEMBER':
      return { ...state, dangerousMembers: state.dangerousMembers.filter(m => m.id !== action.memberId) };
    default:
      return state;
  }
};

const AppContext = createContext<{ state: State; dispatch: React.Dispatch<Action> }>({
  state: initialState,
  dispatch: () => undefined,
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
 