<?php

namespace AssistantInterface\App;

use AssistantInterface\App\Lib\SingleTon;

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
        ];
    }
}
