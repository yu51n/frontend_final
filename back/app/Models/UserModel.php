<?php
namespace Models;
use vendor\DB;

class UserModel{
    public function getUsers(){
        $sql = "SELECT  *  FROM  `user`";
        $arg = NULL;
        return DB::select($sql, $arg);
    }
    public function getUser($id){
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
    public function getRoles($id){
        $sql = "SELECT role_id  FROM  `user_role` WHERE `user_id`=?";
        $arg = array($id);
        $response = DB::select($sql, $arg);
        $result = $response['result'];
        for ($i=0; $i < count($result); $i++) { 
            $result[$i] = $result[$i]['role_id'];    
        }
        $response['result'] = $result;
        return $response;
    }
    public function newUser($id, $password, $email, $name){
        try {
            $sql = "INSERT INTO `user` (`id`, `password`, `email`, `name`) VALUES (?, ?, ?, ?)";
            DB::insert($sql, array($id, $password, $email, $name));
            
            // 新增 user_role，預設角色 2（一般會員）
            $roleSql = "INSERT INTO `user_role` (`user_id`, `role_id`) VALUES (?, ?)";
            DB::insert($roleSql, array($id, 2));

            return [
                'status' => 200,
                'message' => '註冊成功'
            ];
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                // 主鍵重複
                return [
                    'status' => 400,
                    'message' => '帳號已存在，請更換帳號'
                ]; 
            }
        }
    }    
    public function removeUser($id){
       // 先刪除 user_role 裡的 user_id
        $sql1 = "DELETE FROM `user_role` WHERE user_id = ?";
        \vendor\DB::delete($sql1, array($id));

        // 再刪除 user 表的資料
        $sql2 = "DELETE FROM `user` WHERE id = ?";
        return \vendor\DB::delete($sql2, array($id));
    }
    public function updateUser($args){
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