import IndexedDataList from "../components/IndexedDataList";
import { ContextProvider } from "../store";

const KnowledgeBase = () => {
    return (
        <ContextProvider>
            <div className='max-w-[850px] mx-auto p-6'>
                <IndexedDataList />
            </div>
        </ContextProvider>
    )
}

export default KnowledgeBase;
