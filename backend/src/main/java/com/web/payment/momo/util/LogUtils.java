package com.web.payment.momo.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/***
 * @author uyen.tran
 */
public class LogUtils {
    private static final Logger logger = LoggerFactory.getLogger(LogUtils.class);

    public static void init(){
    }

    public static void info(String serviceCode, Object object){
        logger.info("[{}]: {}", serviceCode, object);
    }
    public static void info(Object object){
        logger.info(String.valueOf(object));
    }

    public static void debug(Object object){
        logger.debug(String.valueOf(object));
    }

    public static void error(Object object){
        logger.error(String.valueOf(object));
    }

    public static void warn(Object object){
        logger.warn(String.valueOf(object));
    }
}
