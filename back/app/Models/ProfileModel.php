<?php
namespace Models;
use vendor\DB;

class ProfileModel{
    public function getProfile($id){
        $sql = "SELECT  *  FROM  `user` WHERE `id`=?";
        $arg = array($id);
        return DB::select($sql, $arg);
    }
    public function checkIdPw($id, $pw){
        $sql = "SELECT  *  FROM  `user` WHERE `id`=? and `password`=?";
        $arg = array($id, $pw);
        $response = DB::select($sql, $arg);
        $rows = $response['result'];
        if(count($rows)==0){
            $response['status'] = 404;
            $response['message']  = 'Not found';
        }
        return $response;
    }
    public function removeProfile($id){
        // 先刪除 user_role 裡的 user_id
        $sql1 = "DELETE FROM `user_role` WHERE user_id = ?";
        \vendor\DB::delete($sql1, array($id));

        // 再刪除 user 表的資料
        $sql2 = "DELETE FROM `user` WHERE id = ?";
        return \vendor\DB::delete($sql2, array($id));
    }
    public function updateProfile($args){
        // 1. 先更新 user_role，只傳需要的參數
        if ($args[':id'] !== $args[':preid']) {
            $roleArgs = [
                ':id' => $args[':id'],
                ':preid' => $args[':preid']
            ];
            $sql2 = "UPDATE `user_role` SET `user_id`=:id WHERE `user_id`=:preid";
            \vendor\DB::update($sql2, $roleArgs);
        }

        // 2. 再更新 user
        $sql = "UPDATE `user` SET `id`=:id, `password`=:password, `email`=:email, `name`=:name WHERE `id`=:preid";
        $result = \vendor\DB::update($sql, $args);

        return $result;
    }
}
?>