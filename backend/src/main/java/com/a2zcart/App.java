package com.a2zcart;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class App {
  public static void main(String[] args) {
    String password = (args.length > 0 && args[0] != null && !args[0].isBlank())
        ? args[0]
        : "pravin007";
    String url = "jdbc:postgresql://a2z.cn4k6qwks3p5.ap-south-1.rds.amazonaws.com:5432/postgres?sslmode=verify-full&sslrootcert=./global-bundle.pem";
    
    System.out.println("Checking AWS RDS database for tables and duplicate users...");
    try (Connection conn = DriverManager.getConnection(url, "a2z", password);
         Statement st = conn.createStatement()) {
      
      DatabaseMetaData meta = conn.getMetaData();
      try (ResultSet tables = meta.getTables(null, "public", "users", null)) {
        if (tables.next()) {
          System.out.println("Table 'users' exists. Fetching current records:");
          try (ResultSet rs = st.executeQuery("SELECT id, name, email, phone, role FROM users ORDER BY id ASC")) {
            int count = 0;
            while (rs.next()) {
              count++;
              System.out.printf("User #%d: ID=%d, Name=%s, Email=%s, Phone=%s, Role=%s%n",
                  count, rs.getLong("id"), rs.getString("name"), rs.getString("email"), rs.getString("phone"), rs.getString("role"));
            }
            if (count == 0) {
              System.out.println("Table 'users' is empty.");
            }
          }
        } else {
          System.out.println("Table 'users' does not exist yet (Spring JPA DDL will auto-create it on application start).");
        }
      }
    } catch (SQLException e) {
      System.err.println("Database error: " + e.getMessage());
      throw new RuntimeException(e);
    }
  }
}
