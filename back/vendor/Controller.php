<?php
namespace vendor;
abstract class Controller{
    protected static function response($status, $message, $result=NULL){
        $resp['status'] = $status;
        $resp['message'] = $message;
        $resp['result'] = $result;
        return $resp;
    }
}
