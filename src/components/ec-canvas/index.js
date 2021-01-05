import WxCanvas from './wx-canvas';
import * as echarts from './echarts';
import React, { useState } from "react";
import { useNativeEffect } from "remax";
import * as wx from "remax/wechat";
import { Canvas, View } from 'remax/wechat';
import styles from './index.css';
import themes from "./themes";

// 注册主题
themes.forEach(theme => {
    echarts.registerTheme(theme.name, theme.content);
});

// ecCharts = {
//     [id]:{
//         chart,
//         option,
//         theme,
//         isUseNewCanvas
//     }
// }
let ecCharts = {};
let globalThemes = null; // 全局默认主题

function compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
}

function wrapTouch(event) {
    for (let i = 0; i < event.touches.length; ++i) {
        const touch = event.touches[i];
        touch.offsetX = touch.x;
        touch.offsetY = touch.y;
    }
    return event;
};

function initByNewWay(id, canvasId, option, theme) {
    const query = wx.createSelectorQuery();
    query
        .select(`#${id}`)
        .fields({ node: true, size: true })
        .exec(res => {
            const canvasNode = res[0].node;
            const canvasDpr = wx.getSystemInfoSync().pixelRatio;
            const canvasWidth = res[0].width;
            const canvasHeight = res[0].height;
            const ctx = canvasNode.getContext('2d');
            const canvas = new WxCanvas(ctx, canvasId, true, canvasNode)
            echarts.setCanvasCreator(() => {
                return canvas
            })
            ecCharts[id].chart = ((canvas, width, height, dpr) => {
                const chart = echarts.init(canvas, theme, {
                    width: width,
                    height: height,
                    devicePixelRatio: dpr // new
                });
                canvas.setChart(chart);
                chart.setOption(option);
                return chart;
            })(canvas, canvasWidth, canvasHeight, canvasDpr);
        });
}

function initByOldWay(id, canvasId, option, theme) {
    // 1.9.91 <= version < 2.9.0：原来的方式初始化
    const ctx = wx.createCanvasContext(canvasId);
    const canvas = new WxCanvas(ctx, canvasId, false);
    echarts.setCanvasCreator(() => {
        return canvas;
    });
    // const canvasDpr = wx.getSystemInfoSync().pixelRatio // 微信旧的canvas不能传入dpr
    const canvasDpr = 1
    var query = wx.createSelectorQuery();
    query.select(`#${id}`).boundingClientRect(res => {
        ecCharts[id].chart = ((canvas, width, height, dpr) => {
            const chart = echarts.init(canvas, theme, {
                width: width,
                height: height,
                devicePixelRatio: dpr // new
            });
            canvas.setChart(chart);
            chart.setOption(option);
            return chart;
        })(canvas, res.width, res.height, canvasDpr);
    }).exec();
}

/**
 * 加载图表；  
 * 参数id、canvasId为对应EcCanvas组件id、canvasId，这两个参数为必填，缺少这两个参数会产生意料之外的错误；    
 * @param {String} id 
 * @param {String} canvasId 
 * @param {Object} option 
 * @param {String} theme 
 */
function init(id, canvasId, option, theme) {
    const isUseNewCanvas = ecCharts[id].isUseNewCanvas;
    if (!option) {
        option = ecCharts[id].option;
    } else {
        ecCharts[id].option = option;
    }
    if (!theme) {
        theme = globalThemes;
    }
    if (isUseNewCanvas) {
        initByNewWay(id, canvasId, option, theme);
    } else {
        const version = wx.getSystemInfoSync().SDKVersion;
        const isValid = compareVersion(version, '1.9.91') >= 0;
        if (!isValid) {
            console.error('微信基础库版本过低，需大于等于 1.9.91。'
                + '参见：https://github.com/ecomfe/echarts-for-weixin'
                + '#%E5%BE%AE%E4%BF%A1%E7%89%88%E6%9C%AC%E8%A6%81%E6%B1%82');
            return;
        } else {
            console.warn('建议将微信基础库调整大于等于2.9.0版本。升级后绘图将有更好性能');
            initByOldWay(id, canvasId, option, theme);
        }
    }
}

const EcCanvas = props => {

    const [firstRender, setFirstRender] = useState(true); // 是否是首次被渲染，以下的首次均指的是：前一次页面渲染该组件不存在，那么这次渲染组件则是我们所说的首次渲染，而不是指该组件在整个页面的首次出现
    const [isUseNewCanvas, setIsUseNewCanvas] = useState(() => {

        const version = wx.getSystemInfoSync().SDKVersion
        const canUseNewCanvas = compareVersion(version, '2.9.0') >= 0;
        const forceUseOldCanvas = props.forceUseOldCanvas;
        const isUseNewCanvas = canUseNewCanvas && !forceUseOldCanvas; // 判断是否使用新版Canvas
        if (forceUseOldCanvas && canUseNewCanvas) {
            console.warn('开发者强制使用旧canvas,建议关闭');
        }

        if (ecCharts[props.id]) { // 存在该对象着释放原来的图表，避免内存占用
            if (ecCharts[props.id].chart) {
                ecCharts[props.id].chart.dispose();
            }
            ecCharts[props.id] = {
                chart: undefined,
                theme: props.theme ? props.theme : globalThemes,
                option: ecCharts[props.id].option ? ecCharts[props.id].option : {},
                isUseNewCanvas,
            };
        } else { // 不存在说明时第一次创建，创建图表对象并初始化避免异常数据导致错误
            ecCharts[props.id] = {
                chart: undefined,
                theme: props.theme ? props.theme : globalThemes,
                option: props.option ? props.option : {},
                isUseNewCanvas,
            };
        }

        return isUseNewCanvas;
    });

    if (props.option) {
        setOption(props.id, props.option);
    }

    useNativeEffect(() => { // 当该组件存在时监听页面渲染完成
        if (firstRender) { // 如果是首次渲染完成，初始化图表
            echarts.registerPreprocessor(option => {
                if (option && option.series) {
                    if (option.series.length > 0) {
                        option.series.forEach(series => {
                            series.progressive = 0;
                        });
                    }
                    else if (typeof option.series === 'object') {
                        option.series.progressive = 0;
                    }
                }
            });
            if (!props.lazyLoad) {
                init(props.id, props.canvasId, props.option, props.theme);
            }
            setFirstRender(false);
        }
    });

    const touchStart = (e) => {
        const chart = ecCharts[props.id].chart;
        if (chart && e.touches.length > 0) {
            var touch = e.touches[0];
            var handler = chart.getZr().handler;
            handler.dispatch('mousedown', {
                zrX: touch.x,
                zrY: touch.y
            });
            handler.dispatch('mousemove', {
                zrX: touch.x,
                zrY: touch.y
            });
            handler.processGesture(wrapTouch(e), 'start');
        }
    };
    const touchMove = (e) => {
        const chart = ecCharts[props.id].chart;
        if (chart && e.touches.length > 0) {
            var touch = e.touches[0];
            var handler = chart.getZr().handler;
            handler.dispatch('mousemove', {
                zrX: touch.x,
                zrY: touch.y
            });
            handler.processGesture(wrapTouch(e), 'change');
        }
    };
    const touchEnd = (e) => {
        const chart = ecCharts[props.id].chart;
        if (chart) {
            const touch = e.changedTouches ? e.changedTouches[0] : {};
            var handler = chart.getZr().handler;
            handler.dispatch('mouseup', {
                zrX: touch.x,
                zrY: touch.y
            });
            handler.dispatch('click', {
                zrX: touch.x,
                zrY: touch.y
            });
            handler.processGesture(wrapTouch(e), 'end');
        }
    };

    return (
        <View className={ styles.container }>
            { isUseNewCanvas ?
                <Canvas
                    className={ styles.ecCanvas }
                    id={ props.id }
                    canvasId={ props.canvasId }
                    type='2d'
                    onTouchStart={ touchStart }
                    onTouchMove={ touchMove }
                    onTouchEnd={ touchEnd }
                ></Canvas>
                :
                <Canvas
                    className={ styles.ecCanvas }
                    id={ props.id }
                    canvasId={ props.canvasId }
                    onTouchStart={ touchStart }
                    onTouchMove={ touchMove }
                    onTouchEnd={ touchEnd }
                ></Canvas>
            }
        </View>
    )
}

export default EcCanvas;

/**
 * 释放已经加载的图表；  
 * 参数id为对应EcCanvas组件id，这个参数为必填，缺少这个参数会产生意料之外的错误；   
 * @param {String} id 
 */
function dispose(id) {
    if (ecCharts[id] && ecCharts[id].chart) {
        ecCharts[id].chart.dispose();
    }
}

/**
 * 根据EcCanvas组件id获取其对应的chart对象；
 * @param {String} id 
 */
function getChart(id) {
    if (ecCharts[id] && ecCharts[id].chart) {
        return ecCharts[id].chart;
    }
}

/**
 * 根据EcCanvas组件id设置其初始option；   
 * 为什么要提供两种方法设置option？echarts的option一般情况下数据量都比较大，当你使用状态管理时，
 * 我们希望不要将option传来传去，
 * 因此提供这个方法让你可以直接在model中设置option而不需要将他传到视图组件中去设置；  
 * notMerge指定了option是替换还是合并
 * @param {String} id 
 * @param {Object} option 
 * @param {Boolean} notMerge 
 */
function setOption(id, option, notMerge) {
    if (ecCharts[id]) {
        if (ecCharts[id].chart) {
            ecCharts[id].chart.setOption(option, notMerge);
        }
        if (notMerge) {
            ecCharts[id].option = option;
        } else {
            ecCharts[id].option = mergeObject(ecCharts[id].option, option, ['data', 'dataset.*']);
        }
    } else {
        ecCharts[id] = {
            option
        };
    }
}
/**
 * 将object2合并至object1，notMerge传入一个字符串数组，指定要替换而非合并的属性（例：['attr', 'attr1.attr2', 'attr3.*']）
 * @param {Object} object1 
 * @param {Object} object2 
 * @param {*} notMerge 
 * @param {String} chainPath 
 */
function mergeObject(object1, object2, notMerge, chainPath) {
    chainPath = chainPath ? chainPath : 'object1';
    if (typeof object1 === 'object') {
        if (notMerge) {
            for (let i = 0; i < notMerge.length; i += 1) {
                if (notMerge[i].includes('*')) {
                    if (chainPath.substring(0, chainPath.lastIndexOf('.')).includes(notMerge[i].split('.*')[0])) {
                        return object2;
                    }
                } else {
                    if (chainPath.includes(notMerge[i])) {
                        return object2;
                    }
                }
            }
        }
        Object.keys(object2).map((v) => {
            object1[v] = mergeObject(object1[v], object2[v], notMerge, `${chainPath}.${v}`);
        });
        return object1;
    } else {
        return object2;
    }
}
/**
 * 根据EcCanvas组件id获取其初始option
 * @param {String} id 
 */
function getOption(id) {
    if (ecCharts[id]) {
        return ecCharts[id].option;
    }
}

/**
 * 设置全局默认主题
 * @param {String} theme 
 */
function setGlobalThemes(theme) {
    globalThemes = theme;
}

// /**
//  * 保存图表为图片
//  * @param {String} id 
//  * @param {Object} opt 
//  */
// function canvasToTempFilePath(id, opt) {
//     const isUseNewCanvas = ecCharts[id].isUseNewCanvas;
//     if (isUseNewCanvas) {
//         // 新版
//         const query = wx.createSelectorQuery();
//         query
//             .select(`#${id}`)
//             .fields({ node: true, size: true })
//             .exec(res => {
//                 const canvasNode = res[0].node;
//                 opt.canvas = canvasNode;
//                 wx.canvasToTempFilePath(opt);
//             })
//     } else {
//         // 旧的
//         ctx.draw(true, () => {
//             wx.canvasToTempFilePath(opt, this);
//         });
//     }
// }

export const ecTool = {
    getChart,
    setOption,
    getOption,
    init,
    dispose,
    setGlobalThemes
}



