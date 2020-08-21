import React, { useState } from 'react';
import { View, Button } from 'remax/wechat';
import styles from './index.css';
import EcCanvas, { ecTool } from "../../components/ec-canvas";

export default () => {
    const [isDisposed, setIsDisposed] = useState(true);
    const defaultOption = {
        title: {
            text: '测试下面legend的红色区域不应被裁剪',
            left: 'center'
        },
        legend: {
            data: ['A', 'B', 'C'],
            top: 50,
            left: 'center',
            z: 100
        },
        grid: {
            containLabel: true
        },
        tooltip: {
            show: true,
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            // show: false
        },
        yAxis: {
            x: 'center',
            type: 'value',
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
            // show: false
        },
        series: [{
            name: 'A',
            type: 'line',
            smooth: true,
            data: [18, 36, 65, 30, 78, 40, 33]
        }, {
            name: 'B',
            type: 'line',
            smooth: true,
            data: [12, 50, 51, 35, 70, 30, 20]
        }, {
            name: 'C',
            type: 'line',
            smooth: true,
            data: [10, 30, 31, 50, 40, 20, 10]
        }]
    }
    return (
        <View>
            <View className='chart'>
                <EcCanvas
                    id='lazyload'
                    canvasId='lazyload'
                    lazyLoad={ true }
                    option={ defaultOption }
                    theme='biBlue'
                />
            </View>
            <Button
                className={ styles.button }
                onClick={ () => {
                    if (isDisposed) {
                        ecTool.init('lazyload', 'lazyload');
                    } else {
                        ecTool.dispose('lazyload');
                    }
                    setIsDisposed(!isDisposed);
                } }
            >点击加载/释放</Button>
        </View>
    );
};
