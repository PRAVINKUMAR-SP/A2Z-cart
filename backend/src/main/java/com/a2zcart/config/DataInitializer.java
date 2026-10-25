package com.a2zcart.config;

import com.a2zcart.model.*;
import com.a2zcart.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SellerCompanyRepository sellerCompanyRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        // 1. Seed Approved Seller
        User sellerUser1 = new User(
                "Vikram Singhania",
                "seller@techhub.com",
                passwordEncoder.encode("Seller@123"),
                "+91 98220 11223",
                Role.ROLE_SELLER
        );
        userRepository.save(sellerUser1);

        SellerCompany seller1 = new SellerCompany();
        seller1.setUser(sellerUser1);
        seller1.setCompanyName("TechHub Retailers Pvt Ltd");
        seller1.setBusinessType("Private Limited");
        seller1.setGstin("29ABCDE1234F1Z5");
        seller1.setPanNumber("ABCDE1234F");
        seller1.setRegisteredAddress("No. 45, Industrial Suburb, Yeshwantpur, Bengaluru - 560022");
        seller1.setStoreCategory("electronics");
        seller1.setBankAccount("ICIC0004567 - A/C 9901827491");
        seller1.setStatus(SellerStatus.APPROVED);
        sellerCompanyRepository.save(seller1);

        // 3. Seed Pending Seller
        User sellerUser2 = new User(
                "Neha Kapoor",
                "pending@gadgets.com",
                passwordEncoder.encode("Pending@123"),
                "+91 99112 33445",
                Role.ROLE_SELLER
        );
        userRepository.save(sellerUser2);

        SellerCompany seller2 = new SellerCompany();
        seller2.setUser(sellerUser2);
        seller2.setCompanyName("Gadget Galaxy LLP");
        seller2.setBusinessType("Partnership Firm");
        seller2.setGstin("27AABCG9876K1Z2");
        seller2.setPanNumber("AABCG9876K");
        seller2.setRegisteredAddress("Unit 204, Tech Arcade, Sector 18, Gurugram, Haryana - 122008");
        seller2.setStoreCategory("electronics");
        seller2.setBankAccount("HDFC0001234 - A/C 50100492817291");
        seller2.setStatus(SellerStatus.PENDING);
        sellerCompanyRepository.save(seller2);

        // 4. Seed Buyer
        User buyer = new User(
                "Rahul Sharma",
                "buyer@example.com",
                passwordEncoder.encode("Buyer@123"),
                "+91 98765 43210",
                Role.ROLE_BUYER
        );
        userRepository.save(buyer);

        // 5. Seed Flagship Products (Prices in integer paise)
        Product p1 = new Product();
        p1.setName("Aetheris Pro Spatial Wireless Headphones");
        p1.setTagline("Lossless Hi-Res Audio with 45dB Active Hybrid Noise Cancellation");
        p1.setDescription("Custom titanium drivers, dual spatial audio gyroscopes, and up to 60 hours of playback.");
        p1.setCategory("electronics");
        p1.setPrice(1499900L); // ₹14,999.00
        p1.setOriginalPrice(2499900L); // ₹24,999.00
        p1.setDiscountPercent(40);
        p1.setStock(24);
        p1.setRating(4.8);
        p1.setReviewsCount(342);
        p1.setHas3DModel(true);
        p1.setModelShape("headphones");
        p1.setImage("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80");
        p1.setSeller(seller1);
        p1.setSellerName(seller1.getCompanyName());
        productRepository.save(p1);

        Product p2 = new Product();
        p2.setName("CyberPulse Chrono OLED Smartwatch");
        p2.setTagline("Titanium Grade 5 Case, Dual-Engine GPS & Heart Bio-Tracker");
        p2.setDescription("Curved AMOLED display with sapphire crystal and 14-day battery life.");
        p2.setCategory("wearables");
        p2.setPrice(899900L); // ₹8,999.00
        p2.setOriginalPrice(1599900L);
        p2.setDiscountPercent(43);
        p2.setStock(45);
        p2.setRating(4.7);
        p2.setReviewsCount(512);
        p2.setHas3DModel(true);
        p2.setModelShape("watch");
        p2.setImage("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80");
        p2.setSeller(seller1);
        p2.setSellerName(seller1.getCompanyName());
        productRepository.save(p2);
    }
}
