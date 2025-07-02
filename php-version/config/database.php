<?php
/**
 * Database Configuration for Meds-Go Medical Marketplace
 * cPanel MySQL Connection Configuration
 */

// cPanel Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'medsgo_NPDB');
define('DB_USER', 'medsgo_AK');
define('DB_PASS', '28hZV72o1zU[');
define('DB_CHARSET', 'utf8mb4');

// Database connection class using both PDO and MySQLi
class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $charset = DB_CHARSET;
    private $pdo;
    private $mysqli;

    /**
     * Get PDO database connection (preferred for prepared statements)
     */
    public function getConnection() {
        $this->pdo = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());
            die("Database connection failed. Please check your configuration.");
        }

        return $this->pdo;
    }

    /**
     * Get MySQLi connection (alternative method)
     */
    public function getMySQLiConnection() {
        $this->mysqli = new mysqli($this->host, $this->username, $this->password, $this->db_name);
        
        if ($this->mysqli->connect_error) {
            error_log("MySQLi connection failed: " . $this->mysqli->connect_error);
            die("Database connection failed: " . $this->mysqli->connect_error);
        }
        
        // Set charset
        $this->mysqli->set_charset($this->charset);
        
        return $this->mysqli;
    }

    /**
     * Execute a query with parameters
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch(PDOException $e) {
            error_log("Database query error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get single row
     */
    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    /**
     * Get all rows
     */
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Get last inserted ID
     */
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }

    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit() {
        return $this->pdo->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->pdo->rollback();
    }
}

// Create global database instance
$database = new Database();
$db = $database->getConnection();

// Test database connection
try {
    $db->query("SELECT 1");
} catch(Exception $e) {
    error_log("Database connection test failed: " . $e->getMessage());
}
?>