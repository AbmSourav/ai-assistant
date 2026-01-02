import { createContext, useState } from 'react';

export const AppStore = createContext({});
export function ContextProvider({ children }) {
    const [ store, setStore ] = useState({});

    return (
        <AppStore.Provider value={{ store, setStore }}>
            {children}
        </AppStore.Provider>
    );
}
