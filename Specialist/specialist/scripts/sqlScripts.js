/** Все скрипты запросов в БД */

import { Sequelize, INTEGER } from 'sequelize';
var GodObj = {};
import  fs from 'fs';
import * as sequelize from 'sequelize';
import bcrypt from 'bcrypt'
/*import values from "../ru/values.json");*/


/** Скрипт подклчения к БД ms SQL, создание образов*/
const sqlConnect = () => {
    const sequelize = new Sequelize('specialist', 'test', '12345', {
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: true
        },
        host: 'DESKTOP-A98K2M7',
        dialect: 'mssql'
    });
    GodObj.sequelize = sequelize;
    try {
        sequelize.authenticate();
        console.log('Connection has been established successfully.');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    /** Образ пользователя, таблица Users*/
    const User = sequelize.define('User', {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: Sequelize.TEXT,
            allowNull: false,

        },
        password: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        name: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        phone: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        confirmed: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        }
    },
        {
            tablename: 'dbo.Users'
        });
    GodObj.user = User;

    /** Обращ специалиста, таблица Workers*/
    const Worker = sequelize.define('Worker', {
        email: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        password: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        name: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        surname: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        phone: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        city: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        workerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }

    },
        {
            tablename: 'dbo.Workers'
        });
    GodObj.worker = Worker;

    /** Обращ услуги, таблица Services*/
    const Service = sequelize.define('Service', {
        serviceId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        serviceName: {
            type: Sequelize.TEXT,
            allowNull: false,

        },
        TypeId: {
            type: Sequelize.TEXT,
            allowNull: false
        },

    },
        {
            tablename: 'dbo.Services'
        });
    GodObj.service = Service;

    /** Смежный обра услуг, которые предоставляет каждый специалист, таблица ServiceWorkers*/
    const ServiceWorkers = sequelize.define("ServiceWorkers", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        city: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        distance: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        comment: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    },
        {
            tablename: 'dbo.ServiceWorkers'
        });
    GodObj.serviceWorkers = ServiceWorkers;

    /** Образ заказа, таблица Orders */
    const Order = sequelize.define("Orders", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        distance: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        date: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        city: {
            type: Sequelize.TEXT,
            allowNull: false
        }

    });
    GodObj.order = Order

    /** Смежный образ чатов, таблица Chats*/
    const Chat = sequelize.define('Chats', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },

    });
    GodObj.chat = Chat

    /** Смежный образ сообщений, таблица Messages */
    const Message = sequelize.define('Messages', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        role: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });
    GodObj.message = Message;

    /** Образ  города, таблица cities */
    const City = sequelize.define("Cities", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    },
        {
            tablename: 'dbo.Citites'
        });
    GodObj.city = City;
    

    /** Описание связей в БД */
    Message.belongsTo(Chat);
    Chat.hasMany(Message);
    Chat.belongsTo(Order);
    Chat.belongsTo(Worker);
    Chat.belongsTo(User);
    Order.hasMany(Chat);
    User.hasMany(Chat);
    Worker.hasMany(Chat);
    
    User.hasMany(Order)
    Service.hasMany(Order)
    Order.belongsTo(Service)
    Order.belongsTo(User)
    Worker.belongsToMany(Service, { through: ServiceWorkers })
    Service.belongsToMany(Worker, { through: ServiceWorkers })
}


/** Скрипт регистрации пользователя входят значения: email, пароль 
 * Выходные значения: true / false
 */
const registerUser = async (email_str, password_str) => {
    const User = GodObj.user;
    var answer = '';
    if (email_str == undefined || password_str == undefined) {
        answer = false;
        return
    };
    await User.findOne({ where: { email: email_str } })
        .then(async (user) => {
            if (user == null) {
                await User.create({ email: email_str, password: password_str, confirmed: 0 });
                answer = true;
            } else {
                answer = false;
            }
        }).catch(err => console.log(err));
    return answer
};

/** Скрипт аутенфикации пользователя входят значения: email, пароль 
 * Выходные значения: true / false
 */
const loginUser = async (email_str, password_str) => {
    
    var answer = [];
    if (email_str == undefined || password_str == undefined) {
        answer.push(false);
        return
    };
    var User = GodObj.user;
        await User.findOne({ where: { email: email_str } })
            .then(async (user) => {
            if (user == null) {
                answer.push(false, null);
            } else {

                    if (password_str == user.password ) {
                        answer.push(true, user.userId, user.name, user.phone);
                        return
                    } else {
                        answer.push(false, null);
                        return
                    }
                
                };
            }).catch(err => console.log(err));

    return answer
};

/** Скрипт аутенфикации работника входят значения: email, пароль 
 * Выходные значения: true / false
 */
const loginWorker = async (email_str, password_str) => {
    var Worker = GodObj.worker
    var answer = [];
    if (email_str == undefined || password_str == undefined) {
        answer.push(false);
        return
    };
    await Worker.findOne({ where: { email: email_str } })
        .then(async (worker) => {
            if (worker == null) {
                answer.push(false, null)
            } else {
                    if (password_str == worker.password) {
                        answer.push(true, worker.workerId, worker.name, worker.phone);
                        return
                    } else {
                        answer.push(false, null);
                        return
                    }
            }
        
        }).catch(err => console.log(err));
    return answer
}; 

/** Скрипт регистрации работника входят значения: email, пароль, имя, фамилия, телефон, город, список услуг 
 * Выходные значения: true / false / 'already exists'
 *
 */
const registerWorker = async (email_str, password_str, name_str, surname_str, phone_str, city_str, servicesList) => {
    var Worker = GodObj.worker;
    var Service = GodObj.service;
    var ServiceWorkers = GodObj.serviceWorkers;
    var City = GodObj.city;
    var answer = ''
    if (email_str == undefined || password_str == undefined || name_str == undefined || surname_str == undefined || phone_str == undefined
        || servicesList == undefined) {
        answer = false;
        return
    };
    await Worker.findOne({ where: { email: email_str } })
        .then(async (worker) => {
            if (worker == null) {
                var nameChek = `/[A-Za-zА-Яа-яԱ-Ֆա-ֆ]{${name_str.length},}/`;
                var surnameCheck = `/[A-Za-zА-Яа-яԱ-Ֆա-ֆ]{${surname_str.length},}/`;
                if (eval(nameChek).test(name_str) == false || eval(surnameCheck).test(surname_str) == false
                    || phone_str != String(parseInt(phone_str))) {
                    answer = false;
                    return
                } else {
                    await City.findOne({
                        where: {
                            name: city_str
                        }
                    }).then(async (city) => {
                        if (city == null) {
                            answer = false
                            return
                        } else {

                            await Worker.create({ email: email_str, password: password_str, name: name_str, surname: surname_str, phone: phone_str, city: city_str })
                                .then(async (worker) => {
                                    if (!worker) {
                                        answer = false;
                                        return
                                    };
                                    if (typeof (servicesList) == 'object') {
                                        if (servicesList.length != 1) {
                                            for (var i = 0; i < servicesList.length / 4; i++) {
                                                var priceValue = servicesList[(i * 4) + 1]
                                                if (servicesList[(i * 4) + 2] == 'true' || servicesList[(i * 4) + 2] == 'false') {
                                                    if (priceValue != String(parseInt(priceValue))) {
                                                        answer = false;
                                                        return
                                                    } else {
                                                        var serviceIdValue = servicesList[(i * 4)];
                                                        var distanceValue = 0;
                                                        if (servicesList[(i * 4) + 2] == 'true') {
                                                            distanceValue = 1;
                                                        };
                                                        var commentValue = (servicesList[(i * 4) + 3]);

                                                        /** Добавление услуги в ServiceWorker*/
                                                        await Service.findOne({ where: { serviceId: serviceIdValue } })
                                                            .then(async (service) => {
                                                                if (!service) {
                                                                    return
                                                                } else {
                                                                    await worker.addService(service, {
                                                                        through: {
                                                                            city: city_str, distance: distanceValue,
                                                                            price: priceValue, comment: commentValue
                                                                        }
                                                                    });
                                                                };
                                                            });
                                                    };
                                                } else {
                                                    answer = false;
                                                    return
                                                };
                                            };
                                            answer = true;
                                            return
                                        } else {
                                            answer = true;
                                            return
                                        };
                                    };
                                });
                        };
                    });
                };
            } else {
                answer = 'already exists';
                return
            };
        });
    return answer
};

/** Скрипт изменения данных пользователя, входят значения: id пользователя, название столбца, значение 
 * Выходные значения: true / false
 */
const changeUser = async (userIdValue, columnName, value) => {
    var User = GodObj.user;
    var answer = '';
    if (userIdValue == undefined || columnName == undefined || value == undefined) {
        answer = false;
        return
    };
    await User.findOne({ where: { userId: userIdValue } })
        .then(user => {
            if (user == null) {
                answer = false
                return
            } else { 
            if (columnName == 'name') {
                var testString = `/[A-Za-zА-Яа-яԱ-Ֆա-ֆ]{${value.length},}/`
                if (eval(testString).test(value)) {
                    user.name = value;
                    user.save();
                    answer = true;
                    return     
                } else {
                    answer = false;
                    return 
                }     
            } if (columnName == 'phone') {
                if (value != String(parseInt(value)) || value.length != 11) {
                    answer = false;
                    return
                } else {
                    user.phone = value;
                    user.save();
                    answer = true;
                }
            } else {
                answer = false;
                }
            }
        });
    return answer;
};


/** Скрипт изменения даных работника входят значения: id специалиста, название столбца, значение 
 * Выходные значения: true / error
 */
const changeWorker = async (workerIdValue, columnName, value) => {
    var Worker = GodObj.worker;
    var answer = '';
    if (workerIdValue == undefined || columnName == undefined || value == undefined) {
        answer = false;
        return
    };
    await Worker.findOne({ where: { workerId: workerIdValue } })
        .then(worker => {
            if (worker == null) {
                console.log('error')
                answer = false;
                return
            } else {
                var testString = `/[A-Za-zА-Яа-яԱ-Ֆա-ֆ]{${value.length},}/`
                if (columnName == 'name') {
                    if (eval(testString).test(value)) {
                        worker.name = value;
                        worker.save();
                        answer = true;
                        return
                    } else {
                        answer = false;
                        return
                    };     
                } if (columnName == 'surname') {
                    if (eval(testString).test(value)) {
                        worker.surname = value;
                        worker.save();
                        answer = true;
                        return
                    } else {
                        answer = false;
                        return
                    }     
                } if (columnName == 'phone') {
                    if (value != String(parseInt(value)) || value.length != 11) {
                        answer = false;
                        return
                    } else {
                        worker.phone = value;
                        worker.save();
                        answer = true;
                        return
                    };
                } else {
                    answer = false;
                    return
                }
            };
        });
    return answer
}

/** Скрипт поиска работника входные значения: id специалитса
 * Выходные значения: id работника, имя, фамилия, город, телефон, дата создания, дата обновления / false
 */
const findWorker = async (workerId) => {
    var Worker = GodObj.worker
    var answer = ''
    if (workerId == undefined || isNaN(parseInt(workerId))) {

        answer = false;
        return answer
    } else {
        await Worker.findOne({
            where: {
                workerId: parseInt(workerId)
            },
            attributes: { exclude: ['password', 'email'] },
        }).then(result => {
            answer = result.dataValues;
            return answer
        });
    };
    return answer
}

/** Скрипт изменения даных работника входят значения: email пользователя 
 * Выходные значения: true / error
 */
const deleteUser = async (id) => {
    var User = GodObj.user;
    var answer = ''
    if (id == undefined) {
        answer = false
        return answer
    } else {
        await User.findOne({
            where: {
                userId: id
            }
        }).then(async (user) => {
            if (user == null) {
                answer = false
                return answer
            } else {
                await user.destroy();
                answer = true
                return answer
            };
        }); 
    };
    return answer
};

/** Скрипт изменения даных работника входят значения: email работника 
 * Выходные значения: true / error
 */
const deleteWorker = async (id) => {
    var Worker = GodObj.worker;
    var answer = ''
    if (id == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(id))) {
            answer = false;
            return answer
        } else {

            await Worker.findOne({
                where: {
                    workerId: id
                }
            }).then(async (worker) => {
                if (worker == null) {
                    answer = false
                    return answer
                } else {
                    await worker.destroy();
                    answer = true
                    return answer
                };
            });
        }
    };
    return answer
};

/** Скрипт получения данных по города. Входные значения: нет
 * Выходные значения: количество работников на город - переписывается json файл или error
 */
const updateJSON = async () => {
    var mas = []
    var Worker = GodObj.worker;
    for (var i = 0; i < values.city.length; i++) {
        await Worker.findAll({ where: { city: values.city[i]["ru"] } }).then(async res => {
            mas.push(values.city[i]);
            mas[i]['amountOfWorkers'] = res.length
            finalMas = {}
            finalMas['city'] = mas
            dictString = JSON.stringify(finalMas);
            fs.writeFile("./specialist/ru/values.json", dictString, {encoding: "utf8"}, function (err, result) {
                if (err) console.log('error', err)
            });
        });
    }
}

/** Скрипт получения списка доступных услуг. Входные значения: нет
 * Выходные значения: список услуг с названием и id услуги
 */
const getServicesList = async () => {
    var Service = GodObj.service
    const services = await Service.findAll();
    var dict = {}
    for (var i = 0; i < services.length; i++) {
        dict[i] = services[i]['serviceName'].trim()
    }
    return dict
}

/** Скрипт создания нового заказа. Входные значения: id пользователя, id услуги, описание заказа, возможность 
 * дистанционной работы, данные о времени исполнения, город
 * Выходные значения: true / false
 */
const createNewOrder = async (userId, serviceId, descriptionValue, distanceValue, dateValue, cityValue) => {
    var answer = ''
    if (userId == undefined || serviceId == undefined || descriptionValue == undefined || distanceValue == undefined ||
        dateValue == undefined || cityValue == undefined) {
        answer = false;
        return answer
    } else {
        var User = GodObj.user;
        var Order = GodObj.order;
        var Service = GodObj.service;
        var City = GodObj.city;
        if (!isNaN(parseInt(userId))) {
            await User.findOne({
                where: {
                    userId: parseInt(userId)
                }
            }).then(async (user) => {
                if (user == null) {
                    answer = false;
                    return
                } else {
                    if (isNaN(parseInt(serviceId))) {
                        answer = false;
                        return answer
                    } else {
                        await Service.findOne({
                            where: {
                                serviceId: parseInt(serviceId)
                            }
                        }).then(async (service) => {
                            if (service == null) {
                                answer = false;
                                return
                            } else {

                                if (distanceValue == 'true') {
                                    var distanceValueBit = 1
                                } if (distanceValue == 'false') {
                                    var distanceValueBit = 0
                                };
                                if (dateValue == 'true' || dateValue == 'false' ||
                                    (!isNaN(Date.parse(dateValue)) && Date.parse(dateValue) > Date.now())) {
                                    await City.findOne({
                                        where: {
                                            name: cityValue
                                        }
                                    }).then(async (city) => {
                                        if (city == null) {
                                            answer = false;
                                            return
                                        } else {
                                            const isActiveStatus = 1;
                                            await Order.create({ description: descriptionValue, UserUserId: userId, ServiceServiceId: serviceId, distance: distanceValueBit, date: dateValue, isActive: isActiveStatus, city: cityValue })
                                                .then(order => {
                                                    if (order == null) {
                                                        answer = false;
                                                        return
                                                    } else {
                                                        answer = true;
                                                        return answer
                                                    };
                                                });
                                        };
                                    });
                                } else {
                                    answer = false;
                                    return false
                                };
                            };
                        });
                    };
                };
            });
        } else {
            answer = false;
            return answer
        };
    };
    return answer
};

/** Скрипт поиска заказа по id пользователя. Входные значения id пользователя
 * Выходные значения: Список из 3 или менее заказов. Id заказа, название услуги
 */
const findOrderByUser = async (userId) => {
    var Order = GodObj.order;
    var Service = GodObj.service;
    var User = GodObj.user;
    var ordersMas = {};
    if (userId == undefined || !isNaN(parseInt(userId))) {
        await User.findOne({
            where: { userId: userId }
        }).then(async (user) => {
            if (user == null) {
                ordersMas['answer'] = false;
                return
            } else {
                await Order.findAll({ where: { UserUserId: userId, isActive: 1 } }).then(async (result) => {
                    if (result.length <= 3) {
                        for (var i = 0; i < result.length; i++) {
                            const orderId = result[i].dataValues.id;
                            ordersMas[orderId] = '';
                            await Service.findByPk(result[i].ServiceServiceId)
                                .then(async (answer) => {
                                    const orderName = answer.dataValues.serviceName;
                                    ordersMas[orderId] = orderName;
                                })
                        }
                    } else {
                        for (var i = result.length - 3; i < result.length; i++) {
                            const orderId = result[i].dataValues.id;
                            ordersMas[orderId] = '';
                            await Service.findByPk(result[i].ServiceServiceId)
                                .then(async (answer) => {
                                    const orderName = answer.dataValues.serviceName;
                                    ordersMas[orderId] = orderName;
                                });
                        };
                    };
                });
            };
        });
    } else {
        ordersMas['answer'] = false;
        return ordersMas
    };
    return ordersMas
};

/** Скрипт поиска заказа по id специалиста. Входные значения: id специалиста 
 * Выходные значения: id заказа, название услуги
 */
const findServicesByWorker = async (workerId) => {
    var Service = GodObj.service;
    var Worker = GodObj.worker;
    var ServiceWorkers = GodObj.serviceWorkers;
    var servicesMas = {};
    if (workerId == undefined) {
        servicesMas['answer'] = false;
        return servicesMas
    } else {
        await Worker.findOne({
            where: { workerId: workerId }
        }).then(async (worker) => {
            if (worker == null) {
                servicesMas['answer'] = false;
                return servicesMas
            } else {
                await ServiceWorkers.findAll({ where: { WorkerWorkerId: workerId } })
                    .then(async (result) => {
                        for (var i = 0; i < result.length; i++) {
                            var serviceId = result[i].ServiceServiceId
                            servicesMas[serviceId] = ''
                            await Service.findByPk(serviceId)
                                .then(async (answer) => {
                                    var serviceName = (answer.dataValues.serviceName)
                                    servicesMas[serviceId] = serviceName;
                                });
                        };
                    });
            };
        });
    };
    return servicesMas
};


/** Скрипт получения деталей заказа. Входные значения: id услуги, id работника
 * Выходные значения: id услуга-рабоник, id работника, id услуги, город, цена, комментарий, готовность дистанционной
 * работы, дата создания, дата обновления
 */
const findServiceDetails = async (serviceId, workerId) => {
    var ServiceWorkers = GodObj.serviceWorkers;
    var Service = GodObj.service;
    var Worker = GodObj.worker;
    var answer = {};
    if (serviceId == undefined || workerId == undefined) {
        answer['answer'] = false;
        return answer
    } else {
        await Worker.findOne({
            where: {
                workerId: workerId
            }
        }).then(async (worker) => {
            if (worker == null) {
                answer['answer'] = false;
                return answer
            } else {
                await Service.findOne({
                    where: { serviceId: serviceId }
                }).then(async (service) => {
                    if (service == null) {
                        answer['answer'] = false;
                        return answer
                    } else {
                        await ServiceWorkers.findOne({ where: { ServiceServiceId: serviceId, WorkerWorkerId: workerId } })
                            .then(result => {
                                answer = result.dataValues;
                            });
                    };
                });
            };
        });
    }
    return answer
};


/** Скрипт изменения услуги-работника. Входные значения: id услуги, id работника, цена, статус дистанционной
 * работы, комментарий
 * Выходные значения: true / error
 */
const changeServiceWorker = async (serviceId, workerId, priceValue, distanceValue, commentValue) => {
    var answer = ''
    var ServiceWorkers = GodObj.serviceWorkers;
    var Worker = GodObj.worker;
    var Service = GodObj.service;
    if (serviceId == undefined || workerId == undefined || priceValue == undefined || distanceValue == undefined || commentValue == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(serviceId))) {
            answer = false;
            return answer
        } else {
            await Service.findOne({
                where: {
                    serviceId: parseInt(serviceId)
                }
            }).then(async (service) => {
                if (service == null) {
                    answer = false;
                    return answer
                } else {
                    if (isNaN(parseInt(workerId))) {
                        answer = false;
                        return answer
                    } else {
                        await Worker.findOne({
                            where: {
                                workerId: parseInt(workerId)
                            }
                        }).then(async (worker) => {
                            if (worker == null) {
                                answer = false;
                                return answer
                            } else {
                                if ((isNaN(parseInt(priceValue)) || parseInt(priceValue) < 0) && priceValue != '') {
                                    answer = false;
                                    return answer
                                } else {
                                    if (distanceValue == 'false' || distanceValue == 'true') {
                                        await ServiceWorkers.findOne({ where: { ServiceServiceId: serviceId, WorkerWorkerId: workerId } })
                                            .then(async (workerService) => {
                                                workerService.price = parseInt(priceValue);
                                                var distanceValueBit = 1
                                                if (priceValue == '') {
                                                    priceValue = 0
                                                }
                                                if (distanceValue == 'false') {
                                                    distanceValueBit = 0
                                                }
                                                workerService.distance = distanceValueBit
                                                workerService.comment = commentValue
                                                workerService.save();
                                                answer = true;
                                                return answer
                                            });
                                    } else {
                                        answer = false;
                                        return answer
                                    }
                                };
                            };
                        });
                    };
                }
            });
        }
    };
    return answer
};


/** Скрипт добавления услуги-работника. Входные значения: id улсуги, id работника, цена, статус дистанционной работы,
 * комментарий
 * Выходные значения: true / error
 */
const addServiceWorker = async (serviceIdValue, workerIdValue, priceValue, distanceValue, commentValue) => {
    var ServiceWorkers = GodObj.serviceWorkers;
    var Worker = GodObj.worker;
    var Service = GodObj.service
    var answer =''
    if (serviceIdValue == undefined || workerIdValue == undefined || priceValue == undefined || distanceValue == undefined || commentValue == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(workerIdValue))) {
            answer = false;
            return answer
        } else { 
        await Worker.findOne({
            where: {
                workerId: parseInt(workerIdValue)
            }
        })
            .then(async (worker) => {
                if (worker == null) {
                    answer = false;
                    return answer
                } else {
                    if (isNaN(parseInt(serviceIdValue))) {
                        answer = false;
                        return answer
                    } else {
                        await Service.findOne({
                            where: {
                                serviceId: parseInt(serviceIdValue)
                            }
                        })
                            .then(async (service) => {
                                if (service == null) {
                                    answer = false;
                                    return answer
                                } else {
                                    if ((isNaN(parseInt(priceValue)) || parseInt(priceValue) < 0) && priceValue != '') {
                                        answer = false;
                                        return answer
                                    } else {
                                        if (distanceValue == 'false' || distanceValue == 'true') {
                                            var distanceValueBit = 1
                                            if (distanceValue == 'false') {
                                                distanceValueBit = 0;
                                            }
                                            if (priceValue == '') {
                                                priceValue=0
                                            }
                                            worker.addService(service, {
                                                through: {
                                                    city: worker.city, distance: distanceValueBit,
                                                    price: parseInt(priceValue), comment: commentValue
                                                }

                                            });
                                            
                                            answer = true;
                                            return answer
                                        } else {
                                            answer = false;
                                            return answer
                                        };
                                    };
                                };
                            });
                    };
                };
            });
        };
    };
    return answer
};



/** Скрипт поиска подходящих заказов для специалиста. Входные значения: id работника
 * Выходные значения: список заказов с id Заказа, описание, дата создания, дата обновления, статус дистанционной работы,
 * статус заказа, город, id пользователя, имя пользователя, телефон, id услуги.
 * название услуги, тип услуги
 */
const findAvailableOrders = async (workerId) => {
    var Service = GodObj.service;
    var ServiceWorkers = GodObj.serviceWorkers;
    var User = GodObj.user;
    var dict = [];
    var Order = GodObj.order;
    if (workerId == undefined) {
        dict['answer'] = false;
        return dict
    } else { 
        if (isNaN(parseInt(workerId))) {
            answer = false;
            return answer
        } else { 
            await ServiceWorkers.findAll({
                where: {
                    WorkerWorkerId: workerId
                }
            }).then(async (result) => {
                for (var i in result) {
                    var serviceIdValue = result[i].dataValues.ServiceServiceId;
                    var distanceValue = result[i].dataValues.distance;
                    var workerCity = result[i].dataValues.city;
                    await Order.findAll({
                        where:
                        {
                            isActive: 1,
                            ServiceServiceId: serviceIdValue,
                            city: workerCity,
                            distance: {
                                [Sequelize.Op.or]: [0, 1]
                            }
                        },
                        include: [{
                            model: User,
                            attributes: {
                                exclude: ['email', 'password']
                            }
                        }, {
                            model: Service
                        }],
                    }).then(async (result) => {
                        for (var i in result) {
                            await dict.push(result[i].dataValues)
                        }
                    });
                    if (distanceValue == true) {
                        await Order.findAll({
                            where:
                            {
                                isActive: 1,
                                ServiceServiceId: serviceIdValue,
                                city: {
                                    [Sequelize.Op.ne]: workerCity
                                },
                                distance: 1
                            },
                            include: [{
                                model: User,
                                attributes: {
                                    exclude: ['email', 'password']
                                }
                            }, {
                                model: Service

                            }],
                        }).then(async (result) => {
                            for (i in result) {
                                await dict.push(result[i].dataValues)
                            }
                        });
                    };
                };
            });
        };
    };
    return { dict }
}

/** Скрипт получения описания заказа. Входные значения: id заказа
 * выходные значения: id Заказа, описание, дата создания, дата обновления, статус дистанционной работы,
 * статус заказа, город, id услуги, название услуги, тип услуги
 */
const orderDiscription = async (orderId) => {
    var Order = GodObj.order;
    var Service = GodObj.service;
    var answer = '';
    if (orderId == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(orderId))) {
            answer = false;
            return answer
        } else {
            await Order.findOne({
                where:
                    { id: orderId },
                include: Service
            }).then(result => {
                answer = result;
                return result
            });
        };
    };
    return answer
};

/** Скрипт создания нового чата. Входные значения: id работника, id пользователя, id заказа
 * Выходные значения: id чата 
 */
const createNewChat = async (workerId, userId, orderId) => {
    var Chat = GodObj.chat;
    var Order = GodObj.order;
    var Worker = GodObj.worker
    var User = GodObj.user
    var answer = ''
    if (workerId == undefined || userId == undefined || orderId == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(workerId))) {
            answer = false;
            return answer
        } else {
            if (isNaN(parseInt(userId))) {
                answer = false;
                return answer
            } else {
                if (isNaN(parseInt(orderId))) {
                    answer = false;
                    return answer
                } else {
                    await Worker.findByPk(workerId)
                        .then(async (worker) => {
                            await User.findByPk(userId)
                                .then(async (user) => {
                                    await Order.findByPk(orderId)
                                        .then(async (order) => {
                                            await Chat.create({
                                                OrderId: order.dataValues.id, WorkerWorkerId: worker.dataValues.workerId,
                                                UserUserId: user.dataValues.userId
                                            }).then(result => {
                                                answer = result.dataValues;
                                            })
                                        });
                                });

                        });
                }
            }
        }
    }
    return answer
};

/** Скрипт поиска чата. Входные значения: id заказа, id специлиста, id пользователя 
 * Выходные значения: id чата
 */
const findChat = async (orderId, workerId, userId) => {
    var Chat = GodObj.chat;
    var User = GodObj.user;
    var answer = true
    if (workerId == undefined || userId == undefined || orderId == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(workerId))) {
            answer = false;
            return answer
        } else {
            if (isNaN(parseInt(userId))) {
                answer = false;
                return answer
            } else {
                if (isNaN(parseInt(orderId))) {
                    answer = false;
                    return answer
                } else {
                    await Chat.findOne({
                        where: {
                            OrderId: orderId,
                            WorkerWorkerId: workerId,
                            UserUserId: userId
                        },
                        include: {
                            model: User,
                            attributes: {
                                exclude: ['email', 'password']
                            }
                        }
                    }).then(async (result) => {
                        if (result == null) {
                            answer = false
                        } else {
                            answer = result.dataValues;
                        }
                    });
                }
            }
        }
    }
    return answer
};

/** Скрипт создания нового сообщения. Входные значения: id чата, содержание сообщения, роль отправителя
 * Выходные значения: true / false
 */
const newMessage = async (chatId, content, roleValue) => {
    var Message = GodObj.message;
    var Chat = GodObj.chat;
    var answer = '';
    if (chatId == undefined || content == undefined || roleValue == undefined) {
        answer = false;
        return answer
    } {
        if (isNaN(parseInt(chatId))) {
            answer = false;
            return answer
        } else {
            await Chat.findOne({
                where: {
                    id: chatId
                }
            }).then(async (chat) => {
                if (chat == null) {
                    answer = false;
                    return answer
                } else {
                    if (parseInt(roleValue) == 1 || parseInt(roleValue) == 0) {
                        Message.create({
                            content: content,
                            ChatId: chat.id,
                            role: roleValue
                        });
                        answer = true;
                        return answer
                    } else {
                        answer = false;
                        return answer
                    };
                };
            });
        };
    };
    return answer
}

/** Скрипт поиска всех сообщений в чате. Входные значения: id чата
 * Выходные значения: список сообщений с id сообщения, содержание, дата создания, дата изменения, роль отправителя,
 * id чата
 */
const findAllMessages = async (chatId) => {
    var answer = ''
    if (chatId == undefined) {
        answer == false;
        return answer
    } else { 
        if (isNaN(parseInt(chatId))) {
            answer == false;
            return answer
        } else { 
    var Message = GodObj.message
    var answer =''
            await Message.findAll({
                where: {
                    ChatId: parseInt(chatId)
                }
            }).then(result => {
                answer = result
            });
        }
    }
    return answer
}

/** Скрипт поиска чатов по заказу. Входные значения: id пользователя 
 * Выходгные значения: список чатов - id чата, id пользователя, id заказа, id работника, имя работника, фамилия работника.
 * телефон работника, город работника
 */
const findAllChats = async (orderId, userId) => {
    var Chat = GodObj.chat
    var Worker = GodObj.worker
    var answer = ''
    if (orderId == undefined) {
        answer = false
        return answer
    } else {
        if (isNaN(parseInt(orderId))) {
            answer = false
            return answer
        } else {
            await Chat.findAll({
                where: {
                    OrderId: orderId,
                    UserUserId: userId
                },
                include: {
                    model: Worker,
                    attributes: {
                        exclude: ['email', 'password']
                    }
                }
            }).then(result => {
                answer = result
            });
        }
    }
    return answer
}

/**Скрипт поиска пользователя. Входные значения: id пользователя
 * Выходные значения: id пользователя, имя, город, телефон
 */
const findUser = async (userId) => {
    var User = GodObj.user
    var answer = ''
    if (userId == undefined) {
        answer = false
        return false
    } else { 
        if (isNaN(parseInt(userId))) {
            answer = false
            return false
        } else {
            await User.findOne({
                where:
                    { userId: parseInt(userId) },
                attributes: {
                        exclude: ['email', 'password']
                    }
            }).then(result => {
                answer = result
            });
        }
    }
    return answer
}


/** Скрипт изменения заказ. Входные значения: id заказа, описание, статус дистанционной работы, дата выполнения
 * выходные значения: true / false
 */
const changeOrder = async (orderId, userId, description, distance, dateValue) => {
    var Order = GodObj.order;
    var User = GodObj.user;
    var answer = '';
    if (orderId == undefined || description == undefined || distance == undefined || dateValue == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(orderId))) {
            answer = false;
            return answer
        } else {
          if (dateValue == 'true' || dateValue == 'false' ||
                (!isNaN(Date.parse(dateValue)) && Date.parse(dateValue) > Date.now())) {
                if (distance == 'true' || distance == 'false') {
                    var distanceValueBit = 1;
                    if (distance == 'false') {
                        distanceValueBit = 0;
                    };
                    console.log(distanceValueBit)
                    await Order.findOne({
                        where: {
                            id: parseInt(orderId),
                            UserUserId: parseInt(userId)
                        }
                    })
                        .then(async (order) => {
                            if (order == null) {
                                answer = false
                                return answer
                            } else {
                                order.description = description;
                                order.date = dateValue;
                                order.distance = distanceValueBit
                                order.save();
                                answer = true
                                return answer
                            }
                        });
                } else {
                    answer = false
                    return answer
                }
            } else {
                answer = false;
                return answer
            };
        };
    };
    return answer
};


/**Скрипт поиска всех заказов пользователя. Входные значения: id заказа
 * Выходные значения: список закзов - id заказа, описание заказа, дата создания, дата изменения, статус дистанционной работы,
 * статус заказа, дата исполнения, id услуги, название услуги, тип услуги
 */
const findAllOrdersByUser = async (userId) => {
    var Order = GodObj.order;
    var Service = GodObj.service;
    var ordersMas = {};
    if (userId == undefined) {
        orderMas['answer'] = false;
        return orderMas
    } else {
        if (isNaN(parseInt(userId))) {
            orderMas['answer'] = false;
            return orderMas
        } else {
            await Order.findAll({
                where:
                    { UserUserId: userId },
                include: Service
            }).then(async (result) => {

                for (var i = 0; i < result.length; i++) {
                    const orderId = result[i].dataValues
                    ordersMas[i] = orderId
                };
            });
        };
    };
    return ordersMas
};


/** Скрипт изменения статуса заказа. Входные значения; id заказа, статус заказа
 * Выходные значения: true / error
 */
const changeOrderStatus = async (orderId, userId, status) => {
    var Order = GodObj.order
    var User = GodObj.user;
    var answer = ''
    if (orderId == undefined || status == undefined) {
        answer == false;
        return answer
    } else { 
        if (isNaN(parseInt(orderId))) {
            answer = false;
            return answer
        } else {
            await Order.findOne({
                where: {
                    id: orderId,
                    UserUserId: userId
                }
            }).then(order => {
                if (order == null) {
                    answer = false;
                    return false
                } else {
                    if (status == 'true' || status == 'false') {
                        if (status == 'true') {
                            order.isActive = true
                        } else {
                            order.isActive = false
                        }
                        order.save()
                        answer = true
                        return answer
                    } else {
                        answer = false;
                        return false
                    }
                }
            });
        }
    }
    return answer
}

/** Скрипт поиска чатов работника. Входные значения: id работника
 * Выходные значения: id чата, id пользователя, id специалиста, id заказа, описание заказа, дата исполнения, 
 * дистанционная работа, статус заказа, дата создания, дата изменения, id услуги
 */
const findWorkersActiveChats = async (workerId) => {
    var Order = GodObj.order;
    var Chat = GodObj.chat;
    var answer = ''
    if (workerId == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(workerId))) {
            answer = false;
            return answer
        } else {
            await Chat.findAll(
                {
                    where: {
                        WorkerWorkerId: workerId
                    }, include:
                        Order
                }
            ).then(result => {
                answer = result;
                return answer
            });
        }
    }
    return answer
}

/** Скрипт получения имени услуги. Входные данные: id услуги
 * Выходные данные: id услуги, название услуги тип услуги
 */
const getServiceName = async (serviceId) => {
    var Service = GodObj.service;
    var answer = '';
    if (serviceId == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(serviceId))) {
            answer = false;
            return answer
        } else {
            await Service.findOne({ where: { serviceId: serviceId } }).then(result => {
                answer = result;
                return answer
            })
        }
    }
    return answer
}

const userPersonalData = async(userId) => {
    const User = GodObj.user;
    var answer = '';
    if (userId == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(userId))) {
            answer = false;
            return answer
        } else {
            await User.findOne({
                where: {
                    userId: parseInt(userId)
                }
            }).then(user => {
                answer = [user.email, user.password]
            })
        }
    }
    return answer
}


const workerPersonalData = async (workerId) => {
    const Worker = GodObj.worker;
    var answer = '';
    if (workerId == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(workerId))) {
            answer = false;
            return answer
        } else {
            await Worker.findOne({
                where: {
                    workerId: parseInt(workerId)
                }
            }).then(worker => {
                console.log(worker)
                answer = [worker.email, worker.password]
            })
        }
    }
    return answer
}



const chatPersonalData = async (chatId, role) => {
    const Chat = GodObj.chat;
    const User = GodObj.user;
    const Worker = GodObj.worker;
    var answer = '';
    var roleBit = ''

    if (chatId == undefined || role == undefined) {
        answer = false;
        return answer
    } else {
        if (isNaN(parseInt(chatId))) {
            answer = false;
            return answer
        } else {
            if (isNaN(parseInt(role))) {
                answer = false;
                return answer
            } else {
                if (parseInt(role) == 0) {
                    roleBit = User
                } else {
                    roleBit = Worker
                }
                await Chat.findOne({
                    where: {
                        id: parseInt(chatId)
                    }, include: [roleBit]
                }).then(chat => {
                    if (role == 0) {
                        answer = chat.User.userId
                        return chat
                    } else {
                        answer = chat.Worker.workerId
                        return chat
                    }
                    
                })
            }
        }
    }
    return answer
};



/** Экспорт скриптов */
export {
    sqlConnect, registerUser, loginUser, registerWorker, deleteUser, deleteWorker, getServicesList,
    loginWorker, createNewOrder, findOrderByUser, findServicesByWorker, findServiceDetails, changeServiceWorker,
    addServiceWorker, findAvailableOrders, orderDiscription, createNewChat, findChat, newMessage, findAllMessages,
    findAllChats, findUser, changeUser, changeWorker, findWorker, changeOrder, findAllOrdersByUser, changeOrderStatus,
    findWorkersActiveChats, getServiceName, userPersonalData, workerPersonalData, chatPersonalData
};
