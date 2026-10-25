package com.a2zcart.controller;

import com.a2zcart.model.UserAddress;
import com.a2zcart.repository.UserAddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class AddressController {

    @Autowired
    private UserAddressRepository addressRepository;

    @GetMapping
    public ResponseEntity<?> getAddresses(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email
    ) {
        if (userId != null && email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(addressRepository.findByUserIdOrEmailIgnoreCaseOrderByCreatedAtDesc(userId, email.trim()));
        } else if (userId != null) {
            return ResponseEntity.ok(addressRepository.findByUserIdOrderByCreatedAtDesc(userId));
        } else if (email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(addressRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email.trim()));
        }
        return ResponseEntity.ok(List.of());
    }

    @PostMapping
    public ResponseEntity<?> saveAddress(@RequestBody UserAddress address) {
        if (address.getFullName() == null || address.getFullName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Full name is required"));
        }
        if (address.getEmail() == null || address.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        if (address.getPhone() == null || address.getPhone().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
        }
        if (address.getAddress() == null || address.getAddress().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Address is required"));
        }
        if (address.getState() == null || address.getState().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "State is required"));
        }
        if (address.getDistrict() == null || address.getDistrict().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "District is required"));
        }
        if (address.getPincode() == null || address.getPincode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Pincode is required"));
        }
        if (address.getCountry() == null || address.getCountry().trim().isEmpty()) {
            address.setCountry("India");
        }

        // Clean phone: keep only numbers
        address.setPhone(address.getPhone().replaceAll("\\D", ""));
        address.setPincode(address.getPincode().replaceAll("\\D", ""));

        // Check existing user addresses
        List<UserAddress> existing = address.getUserId() != null 
                ? addressRepository.findByUserIdOrderByCreatedAtDesc(address.getUserId())
                : addressRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(address.getEmail());

        if (existing.isEmpty() || Boolean.TRUE.equals(address.getIsDefault())) {
            address.setIsDefault(true);
            if (Boolean.TRUE.equals(address.getIsDefault()) && !existing.isEmpty()) {
                for (UserAddress prev : existing) {
                    if (Boolean.TRUE.equals(prev.getIsDefault())) {
                        prev.setIsDefault(false);
                        addressRepository.save(prev);
                    }
                }
            }
        } else {
            address.setIsDefault(false);
        }

        UserAddress saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        if (addressRepository.existsById(id)) {
            addressRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<?> setDefaultAddress(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email
    ) {
        Optional<UserAddress> opt = addressRepository.findById(id);
        if (opt.isPresent()) {
            List<UserAddress> list = userId != null
                    ? addressRepository.findByUserIdOrderByCreatedAtDesc(userId)
                    : (email != null && !email.trim().isEmpty())
                        ? addressRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(email.trim())
                        : List.of(opt.get());

            for (UserAddress a : list) {
                a.setIsDefault(a.getId().equals(id));
                addressRepository.save(a);
            }
            return ResponseEntity.ok(opt.get());
        }
        return ResponseEntity.notFound().build();
    }
}
