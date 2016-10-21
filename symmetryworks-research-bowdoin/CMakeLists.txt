cmake_minimum_required(VERSION 3.6)
project(sym_works)

set(CMAKE_INCLUDE_CURRENT_DIR ON)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")

set(SOURCE_FILES
    qcustomplot-source/qcustomplot.cpp
    qcustomplot-source/qcustomplot.h
    colorwheel.cpp
    colorwheel.h
    controllerthread.cpp
    controllerthread.h
    display.cpp
    display.h
    functions.cpp
    functions.h
    geomath.h
    historydisplay.cpp
    historydisplay.h
    interface.cpp
    interface.h
    iothread.cpp
    iothread.h
    main.cpp
    mainwindow.cpp
    mainwindow.h
    pairs.h
    polarplane.cpp
    polarplane.h
    port.cpp
    port.h
    renderthread.cpp
    renderthread.h
    shared.h)

set(QT5_PATH /usr/local/Cellar/qt5/5.7.0)
set(QT5_MODULE_PATH ${QT5_PATH}/lib/cmake)
set(CMAKE_PREFIX_PATH ${CMAKE_PREFIX_PATH} ${QT5_MODULE_PATH})

find_package(Qt5Core)
find_package(Qt5Widgets)
find_package(Qt5Gui)
find_package(Qt5Charts)
find_package(Qt5PrintSupport)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_INCLUDE_CURRENT_DIR ON)

#find_package(Qt COMPONENTS Widget Thread Chart)

#message(WARNING "ALL FUCKING VARIABLES: ")
#get_cmake_property(_variableNames VARIABLES)
#foreach (_variableName ${_variableNames})
#    message(WARNING "${_variableName}=${${_variableName}}")
#endforeach()
#
##message(WARNING ${QT_USE_FILE})
#message(WARNING "GUI: ${Qt5Core_PLUGINS}")
#foreach(plugin ${Qt5GUI_PLUGINS})
#    get_target_property(_loc ${plugin} LOCATION)
#    message(WARNING "Plugin ${plugin} is at location ${_loc}")
#endforeach()
#include_directories(${QT_INCLUDES} ${Qt5Widgets_INCLUDE_DIRS})
#include_directories(${QT5_PATH}/include/QtCharts)

add_executable(sym ${SOURCE_FILES})

target_link_libraries(sym Qt5::Core Qt5::Widgets Qt5::Gui Qt5::Charts Qt5::PrintSupport)