package com.web.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import java.sql.Date;
import java.sql.Time;
import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String username;

    private String email;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String fullname;

    private String phone;

    private Boolean actived;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String activation_key;

    private Date createdDate;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String tokenFcm;

    @ManyToOne
    @JoinColumn(name = "authority_name")
    private Authority authorities;
}

