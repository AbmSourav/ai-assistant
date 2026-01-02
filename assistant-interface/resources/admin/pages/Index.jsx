import { __ } from '@wordpress/i18n';

import IndexForm from "../components/IndexForm"
import { ContextProvider } from '../store';

const Index = () => {
    return (
        <ContextProvider>
            <div className='max-w-[800px] mx-auto p-6'>
                <h2 className='text-2xl font-bold mb-6'>
                    {__('Create Knowledge Base', 'assistant-interface')}
                </h2>
                <IndexForm />
            </div>
        </ContextProvider>
    )
}

export default Index;
