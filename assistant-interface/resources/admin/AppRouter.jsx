import Index from "./pages/Index";
import KnowledgeBase from "./pages/KnowledgeBase";

const route = new URLSearchParams(window.location.search);

const routeList = {
    index: 'ai-assistant-interface',
    knowledgeBase: 'ai-assistant-knowledge-base'
}

const AppRouter = () => {
    for (const routeName of Object.values(routeList)) {
        if (routeList?.knowledgeBase === route.get('page')) {
            return <KnowledgeBase />
        }

        return <Index />
    }
}

export default AppRouter;
