<?php

namespace AssistantInterface\App\Lib;

if (!defined('ABSPATH')) exit;

class Response
{
	private $response;

	public function __construct($response)
	{
		$this->response = $response;
		return $this;
	}

	public function dump($die = false)
	{
		$data = $this->response;
		if (function_exists('dump')) {
			if ($die) {
				\dd($data);
			} else {
				\dump($data);
			}
		} else {
			echo '<pre>';
			var_dump( $data ); // @phpcs:ignore
			echo '</pre>';
		}
	}

	public function getBody($decode = true)
	{
		if ($decode) {
			return json_decode(\wp_remote_retrieve_body($this->response), true);
		}
		return \wp_remote_retrieve_body($this->response);
	}

	public function getStatusCode()
	{
		return (int)\wp_remote_retrieve_response_code($this->response);
	}

	public function getMessage()
	{
		return \wp_remote_retrieve_response_message($this->response);
	}

	public function getHeaders()
	{
		return \wp_remote_retrieve_headers($this->response);
	}

	public function successful()
	{
		return !is_wp_error($this->response) && $this->getStatusCode() >= 200 && $this->getStatusCode() < 300;
	}

	public function failed()
	{
		return is_wp_error($this->response) || $this->getStatusCode() >= 400;
	}

	public function clientError()
	{
		return $this->getStatusCode() >= 500;
	}

	public function serverError()
	{
		return $this->getStatusCode() === 500;
	}
}
