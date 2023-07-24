// 验证邮箱的规则
export var checkEmail = (rule, value, cb) => {
    const regEmail =
        /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (regEmail.test(value) || undefined == value) {
        // 合法的邮箱
        return cb();
    }
    if (!value) return cb();//不填写也可以返回true，如强制填写需要配合required=true使用
    cb(new Error("请输入合法的邮箱"));
};
// 验证手机号码的规则
export var checkMobile = (rule, value, cb) => {
    const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    if (regMobile.test(value)) {
        // 合法的手机号码
        return cb();
    }
    if (!value) return cb();//不填写也可以返回true，如强制填写需要配合required=true使用

    cb(new Error("手机号码格式不正确"));
};
// 验证金额的规则
export var checkMoney = (rule, value, cb) => {
    const Money =
        /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
    if (Money.test(value)) {
        // 合法的金额
        return cb();
    }
    if (!value) return cb();//不填写也可以返回true，如强制填写需要配合required=true使用

    cb(new Error("请输入正确金额格式,可保留两位小数"));
};

// 验证邮箱容积数据的规则，和金额验证相同，但提示不同
export var checkTank = (rule, value, cb) => {
    const Tank =
        /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
    if (Tank.test(value)) {
        // 合法的
        return cb();
    }
    if (!value) return cb();//不填写也可以返回true，如强制填写需要配合required=true使用

    cb(new Error("请输入正确数字格式,可保留两位小数"));
};


