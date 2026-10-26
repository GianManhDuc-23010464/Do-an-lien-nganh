package com.web.api;

import com.web.dto.request.LoginDto;
import com.web.dto.request.PasswordDto;
import com.web.dto.request.TokenDto;
import com.web.dto.request.UserRequest;
import com.web.dto.response.UserDto;
import com.web.entity.User;
import com.web.security.jwt.JwtTokenProvider;
import com.web.mapper.UserMapper;
import com.web.repository.UserRepository;
import com.web.service.UserService;
import com.web.service.MailService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

@RestController
@RequestMapping("/api")
public class UserApi {

    private final UserRepository userRepository;

    private final JwtTokenProvider jwtTokenProvider;

    private final UserUtils userUtils;

    private final MailService mailService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserApi(UserRepository userRepository, JwtTokenProvider jwtTokenProvider, UserUtils userUtils, MailService mailService) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userUtils = userUtils;
        this.mailService = mailService;
    }

    /*token device get from firebase*/
    @PostMapping("/login")
    public TokenDto authenticate(@RequestBody LoginDto loginDto) throws Exception {
        TokenDto tokenDto = userService.login(loginDto.getUsername(), loginDto.getPassword(), loginDto.getTokenFcm());
        return tokenDto;
    }

    @PostMapping("/regis")
    public ResponseEntity<?> regisUser(@RequestBody UserRequest userRequest) throws URISyntaxException {
        User user = userMapper.userRequestToUser(userRequest);
        UserDto result= userMapper.userToUserDto(userService.regisUser(user));
        return ResponseEntity
                .created(new URI("/api/register-user/" + user.getUsername()))
                .body(result);
    }

    @PostMapping("/active-account")
    public ResponseEntity<?> activeAccount(@RequestParam String email, @RequestParam String key) throws URISyntaxException {
        userService.activeAccount(key, email);
        return new ResponseEntity<>("kích hoạt thành công", HttpStatus.OK);
    }

    @PostMapping("/user/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordDto passwordDto){
        userService.changePass(passwordDto.getOldPass(), passwordDto.getNewPass());
        return new ResponseEntity<>("Success", HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> changePassword(@RequestParam String email){
        userService.forgotPassword(email);
        return new ResponseEntity<>("Success", HttpStatus.OK);
    }

    @GetMapping("/admin/get-user-by-role")
    public ResponseEntity<?> getUserByRole(@RequestParam(value = "role", required = false) String role,
                                           @RequestParam(value = "q", required = false) String search,
                                           Pageable pageable){
        String q = "%" + (search == null ? "" : search.trim()) + "%";
        String r = (role == null || role.isBlank()) ? com.web.constants.Constants.ROLE_USER : role;
        Page<UserDto> userDtos = userService.getUserByRole(q, r, pageable);
        return new ResponseEntity<>(userDtos, HttpStatus.OK);
    }

    @GetMapping("/admin/check-role-admin")
    public void checkRoleAdmin(){
    }

    @GetMapping("/user/check-role-user")
    public void checkRoleUser(){
    }

    @PostMapping("/admin/lockOrUnlockUser")
    public void activeOrUnactiveUser(@RequestParam("id") Long id){
        User user = userRepository.findById(id).orElseThrow(() -> new com.web.exception.MessageException("user not found"));
        User me = userUtils.getUserWithAuthority();
        if(me != null && java.util.Objects.equals(me.getId(), user.getId())){
            throw new com.web.exception.MessageException("Không thể tự khóa tài khoản của mình");
        }
        if(Boolean.TRUE.equals(user.getActived())){
            user.setActived(false);
            userRepository.save(user);
            return;
        }
        else{
            user.setActived(true);
            userRepository.save(user);
        }
    }

    @PostMapping("/admin/addaccount")
    public ResponseEntity<?> addaccount(@RequestBody UserRequest userRequest) throws URISyntaxException {
        User user = userMapper.userRequestToUser(userRequest);
        UserDto result= userMapper.userToUserDto(userService.addAccount(user));
        return ResponseEntity
                .created(new URI("/api/register-user/" + user.getUsername()))
                .body(result);
    }
}
