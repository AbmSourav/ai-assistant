<?php

namespace AssistantInterface\App;

use AssistantInterface\App\Lib\SingleTon;
use AssistantInterface\App\Services\AdminInterface;
use AssistantInterface\App\Services\Assets;
use AssistantInterface\App\Services\KnowledgeBase;

if (! defined('ABSPATH')) exit;

final class Core
{
    use SingleTon;

    public function __construct()
    {
        $this->init();
    }

    private function init()
    {
        foreach ($this->loader() as $class) {
            $class::getInstance()->register();
        }
    }

    private function loader()
    {
        return [
            AdminInterface::class,
            Assets::class,
            KnowledgeBase::class,
        ];
    }
}
