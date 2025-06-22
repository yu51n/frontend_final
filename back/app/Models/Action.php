<?php
namespace Models;
use vendor\DB;

class Action{
    public function getRoles($action){
        $sql = "SELECT role_action.role_id  FROM  `action`, `role_action` WHERE  action.name=? and role_action.action_id=action.id";
        $arg = array($action);
        $response = DB::select($sql, $arg);
        $result = $response['result'];
        for ($i=0; $i < count($result); $i++) { 
            $result[$i] = $result[$i]['role_id'];    
        }
        $response['result'] = $result;
        return $response;
    }
}
