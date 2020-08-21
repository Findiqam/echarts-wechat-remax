import React, { useState } from 'react';
import { View, Button } from 'remax/wechat';
import styles from './index.css';
import EcCanvas from "../../components/ec-canvas";

function randomData() {
    let dataList = [];
    for (let i = 0; i < 7; i += 1) {
        dataList.push(Math.round(Math.random() * 100 + 1));
    }
    return dataList;
}

export default () => {
    const [isLoaded, setIsLoaded] = useState(true);
    const [count, setCount] = useState(0);
    const [option, setOption] = useState({
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
    });
    return (
        <View>
            <View className='chart'>
                { isLoaded ?
                    <EcCanvas
                        id='reloadUpdate'
                        canvasId='reloadUpdate'
                        option={ option }
                    />
                    : '图表被移除'
                }
            </View>
            <Button
                className={ styles.button }
                onClick={ () => {
                    setIsLoaded(!isLoaded);
                } }
            >销毁/加载</Button>
            <Button
                className={ styles.button }
                onClick={ () => {
                    setOption({
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
                            data: randomData()
                        }, {
                            name: 'B',
                            type: 'line',
                            smooth: true,
                            data: randomData()
                        }, {
                            name: 'C',
                            type: 'line',
                            smooth: true,
                            data: randomData()
                        }]
                    });
                } }
            >更新数据</Button>
            <Button
                className={ styles.button }
                onClick={ () => {
                    setCount(count + 1);
                } }
            >{ count }</Button>
        </View>
    );
};
