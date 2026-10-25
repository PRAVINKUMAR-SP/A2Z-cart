package com.a2zcart;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class RdsConnectionTest {
    public static void main(String[] args) {
        String password = System.getenv("RDS_PASSWORD") != null ? System.getenv("RDS_PASSWORD") : "";
        String url = "jdbc:postgresql://database-1.cluster-cn4k6qwks3p5.ap-south-1.rds.amazonaws.com:5432/postgres?sslmode=require";

        System.out.println("Attempting connection to AWS RDS: " + url);
        try (Connection conn = DriverManager.getConnection(url, "postgres", password);
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT version()")) {
            if (rs.next()) {
                System.out.println("SUCCESS: Connected to RDS PostgreSQL!");
                System.out.println("Version: " + rs.getString(1));
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
