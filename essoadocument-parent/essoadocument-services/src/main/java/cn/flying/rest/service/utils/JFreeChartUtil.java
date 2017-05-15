package cn.flying.rest.service.utils;
import java.awt.Font;
import java.io.File;
import java.io.IOException;
import java.util.List;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtilities;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.StandardChartTheme;
import org.jfree.chart.axis.CategoryAxis;
import org.jfree.chart.axis.CategoryLabelPositions;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.labels.ItemLabelAnchor;
import org.jfree.chart.labels.ItemLabelPosition;
import org.jfree.chart.labels.PieSectionLabelGenerator;
import org.jfree.chart.labels.StandardCategoryItemLabelGenerator;
import org.jfree.chart.labels.StandardPieSectionLabelGenerator;
import org.jfree.chart.plot.PiePlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.chart.renderer.category.BarRenderer3D;
import org.jfree.data.category.CategoryDataset;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DatasetUtilities;
import org.jfree.data.general.DefaultPieDataset;
import org.jfree.data.general.PieDataset;
import org.jfree.ui.TextAnchor;
import org.jfree.util.TableOrder;

/**
 * 封装JfreeChar
 * 
 * @author wanghongchen 20140828
 */
public class JFreeChartUtil {

  public static void main(String[] args) {
    double[][] data =
        new double[][] { {1230, 1110, 1120, 1210}, {720, 750, 860, 800}, {830, 780, 790, 700,},
            {400, 380, 390, 450}};
    String[] rowKeys = {"苹果", "香蕉", "橘子", "梨子"};
    String[] columnKeys = {" 西安", "西安", "深圳", "北京"};
    CategoryDataset dataset = DatasetUtilities.createCategoryDataset(rowKeys, columnKeys, data);
//    DefaultCategoryDataset d = new DefaultCategoryDataset();
//    d.addValue(100, "a", "aa");
//    d.addValue(200, "b", "bb");
//    d.addValue(300, "c", "aa");
    createChart(new File("d:/a.jpg"), 14, "馆藏统计", "档案类型",
        "数量", dataset, true, 800);
  }

  /**
   * 
   * 规定图形应用的范围
   * 
   */
  public static enum ChartType {
    NONE, LINE_CHART_VERTICAL, LINE_CHART_HORIZONTAL, LINE_CHART3D_VERTICAL, LINE_CHART3D_HORIZONTAL, AREA_CHART_VERTICAL, AREA_CHART_HORIZONTAL, PIE_CHART, PIE_CHART3D, MULTIPLE_PIE_CHART, MULTIPLE_PIE_CHART3D, BER_CHART_VERTICAL, BER_CHART_HORIZONTAL, BER_CHART3D_VERTICAL, BER_CHART3D_HORIZONTAL;
    public int getValue() {
      return this.ordinal() + 1;
    }
  };

  /**
   * 设置主题防止中文乱码和毛刺
   * 
   */
  static {
    /**
     * 创建主题样式
     */
    StandardChartTheme standardChartTheme = new StandardChartTheme("CN");

    /**
     * 设置标题字体
     */
    standardChartTheme.setExtraLargeFont(new Font("宋体", Font.BOLD, 20));

    /**
     * 设置图例的字体
     */
    standardChartTheme.setRegularFont(new Font("宋体", Font.PLAIN, 12));

    /**
     * 设置轴向的字体
     */
    standardChartTheme.setLargeFont(new Font("宋体", Font.PLAIN, 15));

    /**
     * 应用主题样式
     */
    ChartFactory.setChartTheme(standardChartTheme);

  }

  /**
   * 获取默认种类集合
   * 
   * @return 默认种类集合
   */
  public static DefaultCategoryDataset getDefaultCategoryDataset() {
    return new DefaultCategoryDataset();
  }

  /**
   * 获取默认饼集合
   * 
   * @return 默认饼集合
   */
  public static DefaultPieDataset getDefaultPieDataset() {
    return new DefaultPieDataset();
  }

  /**
   * 获取纵向区域图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createAreaChartVertical(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createAreaChart(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.VERTICAL, legend, true, true);
  }

  /**
   * 获取横向区域图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createAreaChartHorizontal(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createAreaChart(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.HORIZONTAL, legend, true, true);
  }

  /**
   * 获取纵向柱状图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createBarChartVertical(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createBarChart(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.VERTICAL, legend, true, true);
  }

  /**
   * 获取横向柱状图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createBarChartHorizontal(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createBarChart(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.HORIZONTAL, legend, true, true);
  }

  /**
   * 获取纵向3D柱状图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createBarChart3DVertical(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createBarChart3D(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.VERTICAL, legend, true, true);
  }

  /**
   * 获取纵向3D柱状图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createBarChart3DHorizontal(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createBarChart3D(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.HORIZONTAL, legend, true, true);
  }

  /**
   * 获取纵向线状图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createLineChartVertical(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createLineChart(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.VERTICAL, legend, true, true);
  }

  /**
   * 获取横向线状图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createLineChartHorizontal(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createLineChart(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.HORIZONTAL, legend, true, true);
  }

  /**
   * 获取纵向3D线状图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createLineChart3DVertical(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createLineChart3D(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.VERTICAL, legend, true, true);
  }

  /**
   * 获取横向3D线状图表
   * 
   * @param title 图表标题
   * @param categoryAxisLabel 分类轴的标签
   * @param valueAxisLabel 值轴标签
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createLineChart3DHorizontal(String title, String categoryAxisLabel,
      String valueAxisLabel, CategoryDataset dataset, boolean legend) {
    return ChartFactory.createLineChart3D(title, categoryAxisLabel, valueAxisLabel, dataset,
        PlotOrientation.HORIZONTAL, legend, true, true);
  }

  /**
   * 获取饼状图表
   * 
   * @param title 图表标题
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createPieChart(String title, PieDataset dataset, boolean legend) {
    return ChartFactory.createPieChart(title, dataset, legend, true, true);
  }

  /**
   * 获取3D饼状图表
   * 
   * @param title 图表标题
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createPieChart3D(String title, PieDataset dataset, boolean legend) {
    return ChartFactory.createPieChart3D(title, dataset, legend, true, true);
  }

  /**
   * 获取多层饼状图表
   * 
   * @param title 图表标题
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createMultiplePieChart(String title, CategoryDataset dataset,
      boolean legend) {
    return ChartFactory.createMultiplePieChart(title, dataset, TableOrder.BY_ROW, legend, true,
        true);
  }

  /**
   * 获取3D多层饼状图表
   * 
   * @param title 图表标题
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 面积图
   */
  public static JFreeChart createMultiplePieChart3D(String title, CategoryDataset dataset,
      boolean legend) {
    return ChartFactory.createMultiplePieChart3D(title, dataset, TableOrder.BY_ROW, legend,
        true, true);
  }

  /**
   * 根据图表类型生成图表图片文件，此方法只用于通用数据集CategoryDataset的接口
   * 
   * @param title 图表标题
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 是否生成
   */
  public static boolean createChart(File chartFile, int chartType, String title,
      String categoryAxisLabel, String valueAxisLabel, CategoryDataset dataset, boolean legend,
      int height) {
    JFreeChart freeChart = null;
    boolean flag = false;
    if (chartType == ChartType.AREA_CHART_VERTICAL.getValue()) {
      freeChart =
          createAreaChartVertical(title, categoryAxisLabel, valueAxisLabel, dataset, legend);
    } else if (chartType == ChartType.AREA_CHART_HORIZONTAL.getValue()) {
      freeChart =
          createAreaChartHorizontal(title, categoryAxisLabel, valueAxisLabel, dataset, legend);
    } else if (chartType == ChartType.LINE_CHART_VERTICAL.getValue()) {
      freeChart =
          createLineChartVertical(title, categoryAxisLabel, valueAxisLabel, dataset, legend);
    } else if (chartType == ChartType.LINE_CHART_HORIZONTAL.getValue()) {
      freeChart =
          createLineChartHorizontal(title, categoryAxisLabel, valueAxisLabel, dataset, legend);
    } else if (chartType == ChartType.LINE_CHART3D_VERTICAL.getValue()) {
      freeChart =
          createLineChart3DVertical(title, categoryAxisLabel, valueAxisLabel, dataset, legend);
    } else if (chartType == ChartType.LINE_CHART3D_HORIZONTAL.getValue()) {
      freeChart =
          createLineChart3DHorizontal(title, categoryAxisLabel, valueAxisLabel, dataset, legend);
    } else if (chartType == ChartType.MULTIPLE_PIE_CHART.getValue()) {
      freeChart = createMultiplePieChart(title, dataset, legend);
    } else if (chartType == ChartType.MULTIPLE_PIE_CHART3D.getValue()) {
      freeChart = createMultiplePieChart3D(title, dataset, legend);
    } else if (chartType == ChartType.BER_CHART_VERTICAL.getValue()) {
      freeChart = createBarChartVertical(title, categoryAxisLabel, valueAxisLabel, dataset, legend);
    } else if (chartType == ChartType.BER_CHART_HORIZONTAL.getValue()) {
      freeChart =
          createBarChartHorizontal(title, categoryAxisLabel, valueAxisLabel, dataset, legend);
    } else if (chartType == ChartType.BER_CHART3D_VERTICAL.getValue()) {
      freeChart =
          createBarChart3DVertical(title, categoryAxisLabel, valueAxisLabel, dataset, legend);
    } else if (chartType == ChartType.BER_CHART3D_HORIZONTAL.getValue()) {
      freeChart =
          createBarChart3DHorizontal(title, categoryAxisLabel, valueAxisLabel, dataset, legend);

    }

    if (freeChart != null) {
      try {
        if (chartType == ChartType.AREA_CHART_VERTICAL.getValue()
            || chartType == ChartType.AREA_CHART_HORIZONTAL.getValue()
            || chartType == ChartType.BER_CHART_VERTICAL.getValue()
            || chartType == ChartType.BER_CHART_HORIZONTAL.getValue()
            || chartType == ChartType.BER_CHART3D_VERTICAL.getValue()
            || chartType == ChartType.BER_CHART3D_HORIZONTAL.getValue()) {
          if (chartType == ChartType.BER_CHART_VERTICAL.getValue()) {
            BarRenderer renderer = (BarRenderer) freeChart.getCategoryPlot().getRenderer();
            renderer.setBaseItemLabelGenerator(new StandardCategoryItemLabelGenerator());
            renderer.setBaseItemLabelsVisible(true);
            ItemLabelPosition itemLabelPositionFallback =
                new ItemLabelPosition(ItemLabelAnchor.OUTSIDE12, TextAnchor.BASELINE_LEFT,
                    TextAnchor.HALF_ASCENT_LEFT, -1.57D);
            renderer.setPositiveItemLabelPositionFallback(itemLabelPositionFallback);
            renderer.setNegativeItemLabelPositionFallback(itemLabelPositionFallback);
          } else if (chartType == ChartType.BER_CHART3D_VERTICAL.getValue()) {
            BarRenderer3D renderer = (BarRenderer3D) freeChart.getCategoryPlot().getRenderer();
            renderer.setBaseItemLabelGenerator(new StandardCategoryItemLabelGenerator());
            renderer.setBaseItemLabelsVisible(true);
            ItemLabelPosition itemLabelPositionFallback =
                new ItemLabelPosition(ItemLabelAnchor.OUTSIDE12, TextAnchor.HALF_ASCENT_LEFT,
                    TextAnchor.HALF_ASCENT_LEFT, -1.57D);
            renderer.setPositiveItemLabelPositionFallback(itemLabelPositionFallback);
            renderer.setNegativeItemLabelPositionFallback(itemLabelPositionFallback);
          }
          freeChart.getCategoryPlot().getDomainAxis().setMaximumCategoryLabelWidthRatio(0.6f);
          // luowenfei 20120208 解决Linux下统计图片标题乱码问题
          if ("/".equals(File.separator)) {
            CategoryAxis domainAxis = freeChart.getCategoryPlot().getDomainAxis();
            NumberAxis numberaxis = (NumberAxis) freeChart.getCategoryPlot().getRangeAxis();

            /*------设置X轴坐标上的文字-默认12----------*/
            domainAxis.setTickLabelFont(new Font("sans-serif", Font.PLAIN, 15));

            /*------设置X轴的标题文字------------*/
            domainAxis.setLabelFont(new Font("宋体", Font.PLAIN, 15));

            /*------设置Y轴坐标上的文字-----------*/
            numberaxis.setTickLabelFont(new Font("sans-serif", Font.PLAIN, 15));

            /*------设置Y轴的标题文字------------*/
            numberaxis.setLabelFont(new Font("宋体", Font.PLAIN, 15));

            /*------这句代码解决了底部汉字乱码的问题-----------*/
            freeChart.getLegend().setItemFont(new Font("宋体", Font.PLAIN, 15));
          }
          // luowenfei 20120208--------------end

          /*freeChart.getCategoryPlot().getDomainAxis()
              .setCategoryLabelPositions(CategoryLabelPositions.UP_45);*/
        }
        freeChart.getCategoryPlot().getDomainAxis()
        .setCategoryLabelPositions(CategoryLabelPositions.UP_45);
        ChartUtilities.saveChartAsJPEG(chartFile, freeChart,
            dataset.getRowCount() * dataset.getColumnCount() * 200, height);
        flag = true;
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
    return flag;
  }

  /**
   * 根据图表类型生成图片，此方法只用于通用数据集PieDataset的接口
   * 
   * @param chartFile 字符文件
   * @param chartType 字符类型
   * @param title 图表标题
   * @param dataset 图表集
   * @param legend 方向 -积方向
   * @return 是否生成
   */
  public static boolean createChart(File chartFile, int chartType, String title,
      PieDataset dataset, boolean legend) {
    JFreeChart freeChart = null;
    boolean flag = false;
    if (chartType == ChartType.PIE_CHART.getValue()) {
      freeChart = createPieChart(title, dataset, legend);
    } else if (chartType == ChartType.PIE_CHART3D.getValue()) {
      freeChart = createPieChart3D(title, dataset, legend);
    }
    if (freeChart != null) {
      try {
        PiePlot piePlot = ((PiePlot) freeChart.getPlot());
        piePlot.setLabelGenerator(new StandardPieSectionLabelGenerator("{0}: {2}"));
        piePlot.setIgnoreNullValues(true);
        piePlot.setIgnoreZeroValues(true);
        piePlot.setNoDataMessage("没有可显示的数据");
        int width =
            dataset.getKeys().size()
                * ((StandardChartTheme) ChartFactory.getChartTheme()).getRegularFont().getSize();
        ChartUtilities.saveChartAsJPEG(chartFile, freeChart,
            getMaxLabelLength(dataset, piePlot.getLabelGenerator()) * 2 + 300, width + 300);
        flag = true;
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
    return flag;
  }

  /**
   * 获取最大标签长度
   * 
   * @param dataset 图表集
   * @param generator 生成标签的数据
   * @return 标签长度
   */
  public static int getMaxLabelLength(PieDataset dataset, PieSectionLabelGenerator generator) {
    int maxLength = 0;
    List<?> list = dataset.getKeys();
    if (list != null) {
      for (Object object : list) {
        String string = (String) object;
        if (string != null) {
          string = generator.generateSectionLabel(dataset, string);
          maxLength = string.length() > maxLength ? string.length() : maxLength;
        }
      }
    }
    return maxLength
        * ((StandardChartTheme) ChartFactory.getChartTheme()).getRegularFont().getSize();
  }

  /**
   * 获取最大值长度
   * 
   * @param dataset 图表集
   * @return 最大值长度
   */
  public static int getMaxValueLength(CategoryDataset dataset) {
    int maxLength = 0;
    List<?> rowList = dataset.getRowKeys();
    List<?> colList = dataset.getColumnKeys();
    if (rowList != null && colList != null) {
      for (Object rowObj : rowList) {
        String row = (String) rowObj;
        for (Object colObj : colList) {
          String col = (String) colObj;
          String string = "" + dataset.getValue(row, col);
          maxLength = string.length() > maxLength ? string.length() : maxLength;
        }
      }
    }
    return maxLength
        * ((StandardChartTheme) ChartFactory.getChartTheme()).getRegularFont().getSize();
  }
}
